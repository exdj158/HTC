Ext.ns('HttpCommander.Lib');

HttpCommander.Lib.Html5ChunkedUpload = function (options) {
    var _self = this;

    this.available = true;

    this.available = HttpCommander.Lib.Utils.isChunkedUploadSupported();

    if (!_self.available) {
        return false;
    }

    // privates
    var statuses = {
        FILE_READY: 0,
        FILE_UPLOADING: 1,
        FILE_COMPLETE: 2,
        FILE_STOPPED: 3,
        FILE_ERROR: 4
    };
    var getUid = function () {
        return ('' + (new Date()).getTime() + '' + Math.floor(Math.random() * 1000000)).substr(0, 18);
    };
    var debugOut = function () {
        if (_self.options.debug === true && window.console && window.console.log) {
            window.console.log(arguments);
        }
    };
    var File = function (fileId, name, size, path) {
        var f = this;
        name = name.replace(/\\/g, '/');
        if (name.lastIndexOf('/') > 0) {
            name = name.substring(name.length, name.lastIndexOf('/') + 1);
        }
        this.id = fileId;
        this.cb = null;
        this.status = 0;
        this.relativePath = path;
        this.name = name;
        this._size = !isNaN(size) && size > 0 ? size : -1;
        this.bytesLoaded = 0;
        this.serverResponse = '';
        this.size = this._size;
        this.fileSize = this._size;
    };
    var reader = null;

    // constants
    // post fields
    var postFields_filePath = 'FilePath',
        postFields_fileName = 'FileName',
        postFields_fileId = 'FileId',
        postFields_fileSize = 'FileSize',
        postFields_filesCount = 'FilesCount',
        postFields_startByte = 'StartByte',
        postFields_complete = 'Complete',
        postFields_querySize = 'QuerySize',
        postFields_isMultiPart = 'IsMultiPart',
        postFields_file = 'File',
        postFields_path = 'Path';

    _self.currentState = statuses.FILE_READY;
    this.requestTime = -1;
    this.options = Ext.apply({}, options);
    this.sendBlobInForm = true;
    this.progressInfo = new (function () {
        var a = this;
        this.totalSize = 0;
        this.uploadedFiles = 0;
        this.uploadedSize = 0;
        this.startTime = new Date();
        this.stopTime = new Date();
        this.lastProgressTime = new Date();
        this.lastBytes = 0;
        this.bandwidth = 0;
        this.avgBw = [];
        this.lastBwStore = new Date();
        this.avBwCurr = 0;
        this.avBwCount = 0;
        this.lastError = null;
        this.getBandwdth = function () {
            var avg = 0,
                i = 0,
                len = a.avgBw.length;
            for (i = 0; i < len; i++) {
                avg += a.avgBw[i];
            }
            return len > 0 ? avg / len : 0;
        };
        this.reset = function (b) {
            a.resetStat(b);
            a.resetProgress(b);
        };
        this.resetStat = function (b) {
            var statInfo = _self.getFileStat();
            a.totalFiles = statInfo[0];
            if (b) {
                a.weights.push(a.totalSize);
            } else {
                a.weights = [];
            }
            a.totalSize = (b ? a.totalSize : 0) + statInfo[1];
            a.uploadedFiles = statInfo[2];
            a.uploadedSize = b ? a.uploadedSize : statInfo[3];
        };
        this.resetProgress = function (b) {
            if (!b) {
                a.startTime = new Date();
            }
            a.stopTime = new Date();
            a.lastProgressTime = new Date();
            a.lastBwStore = new Date();
            a.lastBytes = 0;
            a.bandwidth = 0;
            a.avgBw = [];
            a.avBwCurr = 0
        };
        this.onProgress = function (loaded) {
            var now = new Date();
            a.stopTime = now;
            var duration = now.getTime() - a.lastProgressTime.getTime();
            var bytes = loaded - a.lastBytes;
            if (bytes > 0) {
                a.uploadedSize += bytes;
                if (duration <= 0) {
                    duration = 1;
                }
                a.bandwidth = (bytes / (duration / 1000));
                if (now.getTime() - a.lastBwStore.getTime() > 500 || a.avgBw.length == 0) {
                    if (a.avBwCurr < a.avBwCount) {
                        a.avgBw.push(a.bandwidth);
                    } else {
                        a.avgBw[a.avBwCur] = a.bandwidth;
                    }
                    a.avBwCurr++;
                    a.lastBwStore = now;
                }
                a.lastProgressTime = now;
                a.lastBytes = loaded;
            }
        };
    })();

    this.setUploadInfo = function (uploadInfo) {
        _self.uploadInfo = Ext.apply({}, uploadInfo);
    }

    // listeners:
    // on add files
    var onAddFiles = function (files) {
        debugOut("files added");
        if (_self.currentState != statuses.FILE_UPLOADING) {
            _self.currentState = statuses.FILE_READY;
        }
        _self.files = _self.getFiles();
        if (_self.currentState != statuses.FILE_UPLOADING) {
            _self.progressInfo.reset();
        } else {
            _self.progressInfo.resetStat();
        }
        if (Ext.isFunction(_self.options.onAddFiles))
            _self.options.onFilesAdded(files);
    };
    // on upload start
    var onUploadStartImpl = function () {
        debugOut('on upload start');
        _self.currentState = statuses.FILE_UPLOADING;
        _self.progressInfo.reset();
        if (Ext.isFunction(_self.options.onUploadStart))
            _self.options.onUploadStart();
    };
    // on file upload start
    var onFileUploadStartImpl = function (fileId) {
        debugOut('on file upload start');
        _self.currentState = statuses.FILE_UPLOADING;
        var file = _self.getFile(fileId);
        _self.progressInfo.lastBytes = 0;
        if (file) {
            file.status = statuses.FILE_UPLOADING;
            file.bytesLoaded = 0;
            file.error = '';
        }
        if (Ext.isFunction(_self.options.onFileUploadStart))
            _self.options.onFileUploadStart(file);
    };
    // on file upload progress
    var onFileUploadProgressImpl = function (fileId, loaded) {
        debugOut('on file upload progress');
        if (_self.currentState != statuses.FILE_STOPPED) {
            _self.setCurrentState = statuses.FILE_UPLOADING;
        }
        var file = _self.getFile(fileId);
        if (file) {
            file.bytesLoaded = loaded;
        }
        _self.progressInfo.onProgress(loaded);
        if (Ext.isFunction(_self.options.onFileUploadProgress))
            _self.options.onFileUploadProgress(file, _self.progressInfo);
    };
    // on upload complete
    var onUploadCompleteImpl = function () {
        debugOut('on upload complete');
        _self.currentState = statuses.FILE_COMPLETE;
        if (Ext.isFunction(_self.options.onUploadComplete)) {
            _self.options.onUploadComplete(null, { result: {
                filesSaved: _self.progressInfo.uploadedFiles,
                filesRejected: _self.progressInfo.totalFiles - _self.progressInfo.uploadedFiles,
                msg: _self.progressInfo.lastError
            }
            });
        }
    };
    // on file upload complete
    var onFileUploadCompleteImpl = function (fileId, resp) {
        debugOut('on file upload complete');
        var file = _self.getFile(fileId);
        _self.progressInfo.uploadedFiles++;
        if (file) {
            file.serverResponse = resp;
            if (_self.currentState != statuses.FILE_ERROR) {
                file.status = statuses.FILE_COMPLETE;
            }
            file.bytesLoaded = file.size;
            file.error = '';
            onFileUploadProgressImpl(fileId, file.size);
        }
        if (Ext.isFunction(_self.options.onFileUploadComplete))
            _self.options.onFileUploadComplete(file, resp);
    };
    // on upload error
    var onFileUploadErrorImpl = function (fileId, info, error) {
        debugOut('on file upload error');
        _self.currentState = statuses.FILE_ERROR;
        var file = _self.getFile(fileId);
        if (file) {
            file.status = statuses.FILE_ERROR;
            file.bytesLoaded = 0;
            file.error = (info ? ('' + info + '. ') : '') + error + '.';
        }
        _self.progressInfo.lastError = error;
        if (Ext.isFunction(_self.options.onFileUploadError))
            _self.options.onFileUploadError(file, info, error);
    };
    // on upload stop
    var onUploadStopImpl = function () {
        debugOut('on upload stop');
        _self.progressInfo.stopTime = new Date();
        if (_self.currentState != statuses.FILE_ERROR) {
            _self.currentState = statuses.FILE_READY;
        }
        if (Ext.isFunction(_self.options.onUploadStop))
            _self.options.onUploadStop();
    };
    // on file upload stop
    var onFileUploadStopImpl = function (fileId) {
        debugOut('on file upload stop');
        var file = _self.getFile(fileId);
        if (file) {
            if (_self.currentState != statuses.FILE_ERROR) {
                file.status = statuses.FILE_STOPPED;
            }
            file.bytesLoaded = 0;
            file.error = '';
        }
        onUploadStopImpl();
        if (Ext.isFunction(_self.options.onFileUploadStop))
            _self.options.onFileUploadStop(file);
    };

    //array of selected files
    this.files = [];
    //internal files store 
    this._files = [];
    this.ids = [];
    this.currentId = null;

    // init params
    this.chunkSize = !Ext.isNumber(this.options.chunkSize) || this.options.chunkSize < 0
        ? 262144 : this.options.chunkSize;
    this.url = this.options.url || 'Handlers/ChunkedUpload.ashx';
    this.timeout = Ext.isNumber(this.options.timeout) && this.options.timeout > 0
        ? this.options.timeout : 4294967295;

    this.getFileStat = function () {
        var statInfo = [_self.files.length, 0, 0, 0];
        for (var i = 0, len = _self.files.length; i < len; i++) {
            statInfo[1] += _self.files[i].size > 0 ? _self.files[i].size : 0;
            if (_self.files[i].status == statuses.FILE_COMPLETE) {
                statInfo[2]++;
                statInfo[3] += _self.files[i].size > 0 ? _self.files[i].size : 0;
            }
        }
        return statInfo;
    };

    /**
    * Method called when user select files with browse button
    * @param files - array of selected files
    */
    this.addFiles = function (item) {
        _self.clearList();
        var afiles = item && item.target && item.target.files
                ? item.target.files : item && item.files
                ? item.files : [],
            addedfiles = [],
            file = null,
            path = null,
            fid = null,
            tSize = 0;
        // generate uid for each file item
        // store native file objects in associative array
        for (var i = 0, len = afiles.length; i < len; i++) {
            file = afiles[i];
            if (file.name != '' && file.name != '.') {
                fid = getUid();
                _self.files[fid] = file;
                _self.files.push(file);
                _self.ids.push(fid);
                path = file.webkitRelativePath || file.relativePath;
                file = new File(fid, file.name || file.fileName, file.size || file.fileSize, path ? path : null);
                addedfiles.push(file);
                tSize += file.size;
            }
        }

        // Internal files store. It allow us to switch tabs without loosing file objects
        for (var i = 0; i < addedfiles.length; i++) {
            _self._files[addedfiles[i].id] = addedfiles[i];
            _self._files.push(addedfiles[i]);
        }
    };

    /**
    * Return array of File objects (newly created)
    * @returns {Array}
    */
    this.getFiles = function () {
        return _self._files;
    };

    this.getFilesCount = function () {
        return _self.getFiles().length;
    };

    this.getFile = function () {
        return _self.getFiles()[arguments[1]];
    };

    /**
    * RemoveAll files from list
    */
    this.clearList = function () {
        for (var i = _self._files.length - 1; i >= 0; i--)
            _self.removeFile(_self._files[i].id, true);
        _self.files = [];
        _self._files = [];
        _self.id = [];
        _self.progressInfo.reset();
        _self.currentState = statuses.FILE_READY;
        _self.currentId = null;
    };

    this.removeFile = function (fileId) {
        if (_self.ids.indexOf(fileId) >= 0)
            _self.ids.splice(_self.ids.indexOf(fileId), 1);
        if (_self.files[fileId]) {
            _self.files.splice(_self.files.indexOf(_self.files[fileId]), 1);
            _self.files[fileId] = null;
            delete _self.files[fileId];
        }
        if (_self._files[fileId]) {
            _self._files.splice(_self._files.indexOf(_self._files[fileId]), 1);
            _self._files[fileId] = null;
            delete _self._files[fileId];
        }
    };

    /**
    * Stop upload process
    */
    this.stop = function () {
        if (_self.checkTimer)
            clearInterval(_self.checkTimer);
        if (!_self.stopped) {
            _self.stopped = true;
            if (_self.xhr && _self.xhr.readyState != 4)
                _self.xhr.abort();
        }
    };

    /**
    * Start upload process
    */
    this.upload = function () {
        _self.requestTime = -1;
        _self.stopped = false;
        onUploadStartImpl();
        _self.uploadQueue = _self.ids.slice();
        _self.uploadNext();
    };

    /**
    * Append file to upload queue while upload process is active
    * @param fToAppend
    */
    this.appendToUploadQueue = function (fToAppend) {
        for (var i = fToAppend.length - 1; i >= 0; i--)
            _self.uploadQueue.push(fToAppend[i].id);
    };

    /**
    * Resume upload process after network problem.
    */
    this.resumeUpload = function () {
        _self.progressInfo.uploadedSize -= _self._files[_self.currentId].bytesLoaded;
        _self._files[_self.currentId].bytesLoaded = 0;
        _self.progressInfo.lastBytes = 0;
        _self.uploadNext();
    };

    /**
    * Upload next file
    */
    this.uploadNext = function () {
        _self.xhr = null;
        _self.currentId = _self.uploadQueue.shift();
        _self.chunkSize = !Ext.isNumber(_self.options.chunkSize) || _self.options.chunkSize < 0
            ? 262144 : _self.options.chunkSize;
        /*
        * If there is some file for upload 
        */
        if (_self.currentId && !_self.stopped && _self._files[_self.currentId]
            && _self._files[_self.currentId].status != statuses.FILE_COMPLETE) {
            _self.doChunkedUpload(_self.currentId);
        } else if (_self.uploadQueue.length > 0) {
            _self.uploadNext();
        } else {
            //fire upload complete event
            onUploadCompleteImpl();
        }
    };

    /**
    * Return multipart encoded string 
    * @param xhr - XmlHttpRequest object to set content-type header
    * @returns {String}
    */
    this.getMultipart = function (xhr) {
        var boundary = '----' + getUid(),
            doubledash = '--',
            crlf = '\r\n',
            multipart = '',
            value;
        xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
        // append multipart parameters
        for (name in _self.postFields) {
            if (_self.postFields.hasOwnProperty(name)) {
                value = _self.postFields[name];
                if (name == postFields_file) {
                    // Build RFC2388 blob
                    multipart += doubledash + boundary + crlf +
				        'Content-Disposition: form-data; name="' + name + '"; filename="binarydata"' + crlf +
                        'Content-Type: application/octet-stream' + crlf + crlf + value + crlf;
                } else {
                    multipart += doubledash + boundary + crlf +
		                'Content-Disposition: form-data; name="' + name + '"' + crlf + crlf +
			            unescape(encodeURIComponent(value)) + crlf;
                }
            }
        }
        multipart += doubledash + boundary + doubledash + crlf;
        return multipart;
    };

    /**
    * Upload file by chunks 
    */
    this.sendFileChunks = function (id, startFrom, chunkSize) {
        //var _xhr = HttpCommander.Lib.Utils.getXhrInstance();
        //_self.xhr = _xhr;
        var file = _self.files[id];
        var _file = _self._files[id];

        var browser = navigator.userAgent.toLowerCase();

        /**
        * Load next chunk of data into memory
        * @param startFrom
        * @param chunkSize
        */
        function loadNextChunk(startFrom, chunkSize) {
            reader = reader || new FileReader();
            var startByte = startFrom;
            var stopByte = startByte + _self.chunkSize < _file.size ? startByte + _self.chunkSize : _file.size;
            debugOut('loadNextChunk ' + startByte + " - " + stopByte + " reader " + reader);
            reader.onerror = function (evt) {
                var errorString = "An error occurred reading file.";
                switch (evt.target.error.code) {
                    case evt.target.error.NOT_FOUND_ERR:
                        errorString = 'File Not Found!';
                        break;
                    case evt.target.error.NOT_READABLE_ERR:
                        errorString = 'File is not readable';
                        break;
                    default:
                        errorString = 'An error occurred reading file.';
                }
                onFileUploadErrorImpl(_self.currentId, '', errorString);
                debugOut('upload next: error in read');
                _self.uploadNext();
            };

            // If we use onloadend, we need to check the readyState.
            function loadEnd(evt) {
                if (reader.readyState == FileReader.DONE) { // DONE == 2
                    if (reader.removeEventListener)
                        reader.removeEventListener('loadend', loadEnd);
                    else
                        reader.onload = null;
                    sendFileChunk(id, startByte, reader.result);
                }
            };
            debugOut('before set loadend ' + ' reader.addEventListener ' + reader.addEventListener);
            if (reader.addEventListener)
                reader.addEventListener('loadend', loadEnd);
            else
                reader.onload = loadEnd;
            debugOut('after set loadend');
            try {
                debugOut('before slice');
                var _slice = window.File.prototype.slice || window.File.prototype.mozSlice || window.File.prototype.webkitSlice;
                debugOut("slice " + _slice);
                if (window.FormData) {
                    if (_self.sendBlobInForm) {
                        sendFileChunk(id, startByte, _slice.call(file, startByte, stopByte));
                    } else {
                        debugOut("before call of readAsBinaryString");
                        reader.readAsBinaryString(_slice.call(file, startByte, stopByte));
                    }
                } else {
                    debugOut('FormData is not supported ' + _slice);
                    reader.readAsArrayBuffer(_slice.call(file, startByte, stopByte));
                }
            } catch (e) {
                debugOut("error on read file: " + e);
            }
        };

        /**
        * Upload file chunk to server
        * @param id - id of file
        * @param startFrom - start byte
        * @param data - actual data for upload 
        */
        function sendFileChunk(id, startFrom, data) {
            debugOut('sendFileChunk ' + startFrom);
            var startByte = startFrom ? startFrom : 0;
            var maxChunkSize = 262144000;
            if (data && data.length)
                _self.chunkSize = data.length;
            if (data && data.size)
                _self.chunkSize = data.size;

            var _chunkSize = _self.chunkSize;
            var isLastChunk = startByte + _self.chunkSize >= _file.size;
            debugOut('startByte:' + startByte + ' chunkSize : ' + _self.chunkSize + " isLastChunk " + isLastChunk);
            var fd = null;

            // fix for Firefox
            var _xhr = HttpCommander.Lib.Utils.getXhrInstance();
            _self.xhr = _xhr;

            var _url = _self.url;
            try {
                _url += (_url.indexOf("?") < 0 ? "?" : "&") + "rand=" + getUid() + "&";
                if (!window.FormData || typeof (data) === 'string') {
                    debugOut("FormData is not supported ");
                    _url += postFields_fileName + '=' + encodeURIComponent(_self._files[id].name) + "&";
                    _url += postFields_startByte + '=' + startByte + "&";
                    _url += postFields_complete + '=' + isLastChunk + "&";
                    _url += postFields_fileId + "=" + id;
                    if (_self.uploadInfo) {
                        for (upInfoKey in _self.uploadInfo) {
                            if (_self.uploadInfo.hasOwnProperty(upInfoKey)) {
                                _url += '&' + upInfoKey + '=' + encodeURIComponent(_self.uploadInfo[upInfoKey]);
                            }
                        }
                    }
                }

                try {
                    _xhr.open("POST", _url, true);
                    _xhr.timeout = _self.timeout;
                    _xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2005 00:00:00 GMT");
                } catch (e) { }

                if (window.FormData) {
                    debugOut("FormData supported " + typeof (data));
                    fd = new FormData();
                    _self.postFields = [];
                    _self.postFields[postFields_filePath] = _self._files[id].relativePath;
                    _self.postFields[postFields_fileName] = _self._files[id].name;
                    _self.postFields[postFields_fileId] = id;
                    _self.postFields[postFields_fileSize] = _file.size;
                    _self.postFields[postFields_filesCount] = _self._files.length;
                    _self.postFields[postFields_complete] = isLastChunk ? 'true' : 'false';
                    _self.postFields[postFields_isMultiPart] = 'true';
                    _self.postFields[postFields_startByte] = startByte;
                    if (isLastChunk) {
                        Ext.each(_self.options.customFormFields, function (field) {
                            _self.postFields[field.name] = field.value;
                        });
                    }
                    if (typeof (data) !== 'string') {
                        for (key in _self.postFields)
                            if (_self.postFields.hasOwnProperty(key))
                                fd.append(key, _self.postFields[key]);
                        if (_self.uploadInfo)
                            for (upInfoKey in _self.uploadInfo)
                                if (_self.uploadInfo.hasOwnProperty(upInfoKey))
                                    fd.append(upInfoKey, _self.uploadInfo[upInfoKey]);
                        fd.append(postFields_file, data);
                    } else {
                        _self.postFields[postFields_file] = data;
                        fd = _self.getMultipart(_xhr);
                    }
                }
            } catch (e) {
                return;
            }

            // Add progress, error and start listeners  only if possible
            if (_xhr.upload) {
                _xhr.upload.onloadstart = function (e) {
                    _self.requestTime = new Date().getTime();
                    _xhr.upload.removeEventListener("loadstart", arguments.callee);
                };

                _xhr.upload.onprogress = function (e) {
                    /*if (e.lengthComputable && e.total > 0 ) 
                    onFileUploadProgressImpl(_self.type, id, startByte+e.loaded > _file.size ? _file.size : startByte+e.loaded);
                    */
                };

                _xhr.upload.onerror = function (e) {
                    debugOut('error in xhr');
                    _self.onNetwrokProblem(0, this.statusText ? this.statusText : '');
                };

                _xhr.upload.onabort = function (e) {
                    onFileUploadStopImpl(_self.currentId);
                };
            }

            /**
            * chunk upload complete listener
            */
            function completeListener() {
                debugOut('upload chunk request ' + this.readyState);
                if (this.readyState == 4 && !_self.stopped) {
                    data = null;
                    delete data;
                    fd = null;
                    delete fd;
                    var resp = this.responseText;
                    if (this.status >= 200 && this.status < 300) {
                        if (this.removeEventListener)
                            this.removeEventListener("loadend", completeListener);
                        if (resp && resp != '') {
                            onFileUploadErrorImpl(id, null, resp);
                            debugOut('upload next : last chunk');
                            setTimeout(function () { _self.uploadNext(); }, 1);
                            return;
                        }
                        if (!isLastChunk) {
                            debugOut("Server response " + resp);
                            /* Check response and continue upload if there is no errors
                            */

                            var spendTime = (_self.requestTime >= 0)
                                ? (new Date().getTime() - _self.requestTime) : 1;
                            if (spendTime <= 0)
                                spendTime = 1;
                            if (_self.options.chunkSize < 0 && _self.requestTime > 0) {
                                //it is not first chunk
                                //how may time we spend to upload one chunk?
                                //Debug.printMessage( "time spend: "+(getTimer()-requestTime));																	

                                //How may bytes we upload within 1 second?
                                var bps = Math.round(_self.chunkSize / spendTime * 1000);
                                var realBw = Math.round(_self.progressInfo.getBandwdth());
                                debugOut("current avarage bandwidth: " + realBw);
                                debugOut("max bandwith with current chunksize: " + bps);

                                // if teoretical banwidth with current chunk size more than real, try increase it
                                if (bps > realBw) {
                                    //increase chunck but no more than max allowed chunk size
                                    if (bps > _self.chunkSize) {
                                        if (bps < maxChunkSize)
                                            _self.chunkSize = Math.round(bps);
                                        else
                                            _self.chunkSize = Math.round(maxChunkSize);
                                        debugOut("increase cunksize to : " + _self.chunkSize);
                                    }
                                }
                                if (_self.options.maxChunkSize && _self.chunkSize > _self.options.maxChunkSize)
                                    _self.chunkSize = _self.options.maxChunkSize;
                            }

                            //setTimeout(function(){
                            onFileUploadProgressImpl(id, startByte + _self.chunkSize > _file.size ? _file.size : startByte + _self.chunkSize);
                            //},1);
                            debugOut("Start read from" + (startByte + _chunkSize) + " chunk size is " + _self.chunkSize);
                            //setTimeout(function(){											
                            _xhr = null;
                            _self._xhr = null;
                            delete _xhr;
                            delete _self._xhr;
                            loadNextChunk(startByte + _chunkSize, _self.chunkSize);
                            //}, 1);
                        } else { /* If it was last chunk */
                            setTimeout(function () { onFileUploadCompleteImpl(id, resp); }, 1);
                            debugOut('upload next : last chunk');
                            setTimeout(function () { _self.uploadNext(); }, 1);
                        }
                    } else {
                        debugOut('upload next : bad response code');
                        _self.onNetwrokProblem(this.status, resp);
                    }
                } else if (_self.stopped) {
                    data = null;
                    fd = null;
                    delete data;
                    delete fd;
                    _xhr = null;
                    _self._xhr = null;
                    delete _xhr;
                    delete _self._xhr;
                    onFileUploadStopImpl(_self.currentId);
                }
            };

            _xhr.onreadystatechange = completeListener;

            if (!_self.stopped) {
                if (typeof data !== 'string') {
                    _xhr.send(fd ? fd : data);
                } else {
                    if (_xhr.sendAsBinary) {
                        _xhr.sendAsBinary(fd);
                    } else {
                        var len = fd.length,
                            arr = new Uint8Array(len),
                            i = 0;
                        for (i = 0; i < len; i++) {
                            arr[i] = (fd.charCodeAt(i) & 0xff);
                        }
                        fd = null;
                        delete fd;
                        _xhr.send(arr.buffer);
                        arr.buffer = null;
                        delete arr.buffer;
                        arr = null;
                        delete arr;
                    }
                }
            } else {
                onFileUploadStopImpl(_self.currentId);
            }

            data = null;
            delete data;
        };

        loadNextChunk(startFrom, chunkSize);
    };

    /**
    * Do chunked file upload
    * @param file
    */
    this.doChunkedUpload = function (id, isUpload, startFrom, data) {

        var file = _self.files[id];
        var _file = _self._files[id];
        var xhr = HttpCommander.Lib.Utils.getXhrInstance();

        var checkResponse = !isUpload ? true : false;
        /*Determine from what byte we should start upload process*/
        var startByte = !checkResponse ? (startFrom ? startFrom : 0) : 0;

        var maxChunkSize = 16384000;

        if (!file)
            debugOut('no file!');
        debugOut('startByte:' + startByte + ' chunkSize : ' + _self.chunkSize);
        var _chunkSize = _self.chunkSize;
        var isLastChunk = !checkResponse && startByte + _self.chunkSize >= _file.size;


        var _url = _self.url;
        try {
            _url += (_url.indexOf('?') < 0 ? '?' : '&') + 'rand=' + getUid() + '&';
            _url += postFields_querySize + '=true&';
            _url += postFields_fileName + '=' + encodeURIComponent(_self._files[id].name) + '&';
            _url += postFields_startByte + '=0&';
            _url += postFields_complete + '=false&';
            _url += postFields_fileId + '=' + id;
            if (_self.uploadInfo) {
                for (upInfoKey in _self.uploadInfo) {
                    if (_self.uploadInfo.hasOwnProperty(upInfoKey)) {
                        _url += '&' + upInfoKey + '=' + encodeURIComponent(_self.uploadInfo[upInfoKey]);
                    }
                }
            }
        } catch (error) {
            debugOut(error);
            onFileUploadErrorImpl(_self.currentId, 0, error);
        }
        //append configured form fields here

        try {
            xhr.open("POST", _url, true);
            xhr.timeout = _self.timeout;
        } catch (error) {
            debugOut(error);
        }

        xhr.addEventListener("error", function (e) {
            debugOut('xhr error while check file on server');
            _self.onNetwrokProblem(0, xhr && xhr.statusText ? xhr.statusText : "");
        }, false);

        xhr.addEventListener("abort", function (e) {
            onFileUploadStopImpl(_self.currentId);
        }, false);

        //check server response 
        xhr.onreadystatechange = function (event) {
            //data = null;
            debugOut('check request onreadystatechange' + this.readyState);
            if (this.readyState == 4 && !_self.stopped) {
                var res = this.responseText;

                if (this.status >= 200 && this.status < 300) {
                    try {
                        onFileUploadStartImpl(_self.currentId);
                        /*here we should get amount of uploaded bytes from response*/
                        startByte = parseInt(res) || 0;
                        _self.progressInfo.uploadedSize += startByte;
                        _self._files[id].bytesLoaded = startByte;
                        _self.progressInfo.lastBytes = startByte;
                        //setTimeout(function(){_self.readNextChunk(id, startByte, _self.chunkSize)},10);
                        setTimeout(function () {
                            _self.sendFileChunks(id, startByte, _self.chunkSize);
                        }, 10);
                    } catch (error) {
                        debugOut(error);
                    }
                } else {
                    debugOut('upload next : bad response code');
                    _self.onNetwrokProblem(this.status, this.responseText);
                }
                xhr.onreadystatechange = null;
                xhr = null;
                delete xhr;
            }
        };

        if (!_self.stopped)
            xhr.send();
        else
            onFileUploadStopImpl(_self.currentId);
    };

    /**
    * Initiate periodical connection check when network problems occured. 
    * @param status
    * @param error
    */
    this.onNetwrokProblem = function (status, error) {
        if (_self.options.checkConnectionOnIOError) {
            if (!_self.checkTimer && !_self.stopped) {
                //put current file back to upload queue
                _self.uploadQueue.unshift(_self.currentId);
                //and start checking connection
                _self.checkStartTime = new Date().getTime();
                _self.checkTimer = setInterval(_self.checkConnection, _self.options.checkConnectionInterval ? _self.options.checkConnectionInterval : 2000);
            }
        } else {
            if (_self.currentId)
                onFileUploadErrorImpl(_self.currentId, status, error);
            setTimeout(function () {
                _self.uploadNext();
            }, 1);
        }
    };

    /**
    * Check connection with server 
    */
    this.checkConnection = function () {
        var timeout = (_self.options.checkConnectionUntil ? _self.options.checkConnectionUntil : 10) * 60;
        var timespend = (new Date().getTime() - _self.checkStartTime) / 1000;
        if (timespend > timeout) {
            clearInterval(_self.checkTimer);
            _self.checkTimer = null;
            onFileUploadErrorImpl(_self.currentId, 0, '');
            _self.stop();
        } else {
            var xhr = HttpCommander.Lib.Utils.getXhrInstance();
            var _url = _self.url;

            _url += (_url.indexOf("?") < 0 ? "?" : "&") + "rand=" + getUid();

            try {

                xhr.open("GET", _url, true);
                xhr.timeout = 1000;
            } catch (error) {
                debugOut(error);
            }
            xhr.addEventListener("error", function (e) {
                if (xhr) {
                    xhr.onreadystatechange = null;
                    xhr = null;
                    delete xhr;
                }
            }, false);
            //check server response 
            xhr.onreadystatechange = function (event) {
                if (this.readyState == 4) {
                    var res = this.responseText;

                    if (this.status >= 200 && this.status < 300 && _self.checkTimer) {
                        clearInterval(_self.checkTimer);
                        _self.checkTimer = null;
                        _self.resumeUpload();
                    }
                    xhr.onreadystatechange = null;
                    xhr = null;
                    delete xhr;
                }
            };

            xhr.send();
        }
    };
};
