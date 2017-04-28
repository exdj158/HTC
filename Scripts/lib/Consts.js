Ext.ns('HttpCommander.Lib');

HttpCommander.Lib.Consts = {
    /**
     * File types
     */

    // Pixlr supported types (checked 2016-04-18)
    pixlrSupportedTypes: ';jpg;jpeg;png;gif;bmp;psd;pxd;',

    // Adobe Creative Cloud Online Image Editor supported types
    adobeImageSupportedTypes: ';jpg;jpeg;jpe;jfif;png;bmp;dib;gif;svg;',

    // Images file types
    imagesFileTypes: ';jpg;jpeg;jpe;jfif;bmp;dib;gif;png;tif;tiff;ico;svg;',

    // Extensions for convert in Google Editor
    googleEditFormatsForConvert: ';doc;docm;xls;xlsm;ppt;pps;pptm;ppsm;ppsx;',

    // Extensions for convert in MSOO or Office365
    msooEditFormatsForConvert: ';doc;xls;ppt;pps;',

    // Google viewer supported types (see https://support.google.com/drive/answer/2423485?p=docs_viewer&rd=1).???
    googleDocSupportedtypes: ';doc;docx;docm;ppt;pps;pptx;ppsx;pptm;ppsm;xls;xlsx;xlsm;xlsb;rtf;txt;css;pdf;php;js;c;cs;cpp;h;hpp;mml;svg;tif;tiff;eps;ps;pages;',
    // Box View service supported types (see https://box-view.readme.io/reference#supported-filetypes) (checked 2016-04-18)
    boxViewSupportedtypes: ';pdf;doc;docx;ppt;pptx;xls;xlsx;txt;py;js;xml;css;md;pl;c;m;json;',
    // OWA viewer supported types (see https://support.office.com/en-us/article/View-Office-documents-online-1cc2ea26-0f7b-41f7-8e0e-6461a104544e) (checked 2016-04-18).
    owaSupportedtypes: ';doc;docx;docm;dotm;dotx;xls;xlsx;xlsb;xlsm;pptx;ppsx;ppt;pps;pptm;potm;ppam;potx;ppsm;',
    //! MS Office and OpenOffice.org/LibreOffice supported types documents.
    msoTypesOnlyForSharePointLauncher: 'pub',
    // MS Access only read-only on Edit in MS Office
    //msoAccessTypes: 'accda,accdb,accdc,accde,accdp,accdr,accdt,accdu,ade,adp,maf,mam,maq,mar,mat,mda,mde,mdt,mdw,laccdb,snp',
    msoExcelTypes: 'csv,dbf,dif,ods,prn,slk,xla,xlam,xls,xlsb,xlsm,xlsx,xlt,xltm,xltx,xlw,xml,xps',
    msoOutlookTypes: 'obi,oft,ost,prf,pst,msg,oab,iaf',
    msoPowerTypes: 'emf,odp,pot,potm,potx,ppa,ppam,pps,ppsm,ppsx,ppt,pptm,pptx,rtf,thmx,tif,tiff,wmf,xml,xps',
    msoWordTypes: 'doc,docm,docx,dot,dotm,dotx,htm,html,mht,mhtml,odt,rtf,txt,wps,xml,xps',
    msoFrontPageTypes: 'btr,dwt,elm,fwp,htx,mso',
    msoTypesForViewInBrowser: ';txt;xml;tif;tiff;docx;xlsx;pptx;docm;xlsm;pptm;ppsx;ppsm;',
    msoInfoPathTypes: 'xsn,xsf',
    msoPubTypes: 'pub',
    msoVisioTypes: 'vstx,vstm,vst,vssx,vssm,vss,vsl,vsdx,vsdm,vsd,vdw',
    msoProjectTypes: 'mpp,mpt',

    forbiddenTypesForViewInBrowser: ';htm;html;mht;mhtml;js;vbs;zip;exe;com;bat;cmd;',
    oooSupportedtypes: ';sxd;sxm;sxi;sxc;sxw;odb;odf;odt;ott;oth;and;odm;stw;sxg;doc;dot;xml;docx;docm;dotx;dotm;wpd;wps;rtf;txt;csv;sdw;sgl;vor;uot;uof;jtd;jtt;hwp;602;pdb;psw;\
ods;ots;stc;xls;xlw;xlt;xlsx;xlsm;xltx;xltm;xlsb;wk1;wks;123;dif;csv;sdc;dbf;slk;uos;pxl;wb2;odp;odg;std;otp;otg;sti;ppt;pps;pot;pptx;pptm;potx;potm;ppsx;\
sda;sdd;sdp;uop;cgm;bmp;jpeg;jpg;pcx;psd;svg;wmf;dxf;met;pgm;ras;svm;xbm;emf;pbm;plt;tga;xpm;eps;pcd;png;tif;tiff;gif;pct;ppm;sgf;mml;', // foundation formats (LibreOffice): ;fods;fodg;fodp;fodt;

    // Flow Player file types
    flowplayerFileTypes: ';flv;mp4;f4v;',
    shareCadOrgSupportedTypes: ';dwg;dxf;dwf;hpgl;plt;cgm;pdf;svg;emf;wmf;step;stp;iges;igs;brep;stl;sat;png;bmp;jpg;gif;tiff;tga;cal;',
    /* list of supported input video formats for video convertion command
    for ffmpeg:
    execute command: ffmpeg -formats
    get all formats that with 'D' flag - Demuxing supported
    example output:
    <<<
    skipped
    ---
      E 3g2             3GP2 format
      E 3gp             3GP format
     D  4xm             4X Technologies format
     D  IFF             IFF format
     D  ISS             Funcom ISS format
     D  MTV             MTV format
     DE RoQ             raw id RoQ format
      E a64             a64 - video for Commodore 64
    ---
    skipped
    >>> */
    videoConvertFileTypes: ';4xm;iff;iss;mtv;roq;aac;ac3;act;adf;aea;aiff;alaw;amr;anm;apc;ape;applehttp;asf;ass;au;avi;avs;bethsoftvid;bfi;bin;bink;bit;c93;caf;cavsvideo;cdg;daud;dfa;dirac;dnxhd;dshow;dsicin;dts;dv;dxa;ea;ea_cdata;eac3;f32be;f32le;f64be;f64le;ffm;ffmetadata;film_cpk;filmstrip;flac;flic;flv;g722;gsm;gxf;h261;h263;h264;idcin;idf;image2;image2pipe;ingenient;ipmovie;iv8;ivf;jv;latm;lavfi;lmlm4;loas;lxf;m4v;matroska;webm;microdvd;mjpeg;mlp;mm;mmf;mov;mp4;m2v;m4a;3gp;3g2;mj2;mpc;mpc8;mpg;mpeg;mpegts;mpegtsraw;mpegvideo;msnwctcp;mulaw;mvi;mxf;mxg;nc;nsv;nut;nuv;ogg;ogv;oma;pmp;psxstr;pva;qcp;r3d;rawvideo;rl2;rm;rpl;rso;rtp;rtsp;s16be;s16le;s24be;s24le;s32be;s32le;s8;sap;sdp;shn;siff;smk;sol;sox;spdif;srt;swf;thp;tiertexseq;tmv;truehd;tta;tty;txd;u16be;u16le;u24be;u24le;u32be;u32le;u8;vc1;vc1test;vfwcap;vmd;voc;vqf;w64;wc3movie;wsaud;wsvqa;wtv;wv;xa;xbin;xmv;xwma;yop;yuv4mpegpipe;wmv;',
    html5AudioFileTypes: ';3gp;aac;act;aif;aiff;alac;amr;ape;atrac;au;awb;dct;dss;dvf;iklax;ivs;flac;gsm;m4p;mid;midi;mmf;mp3;mpc;mpw;msv;mxp4;ogg;ra;ram;raw;tta;vox;wav;wma;',


    /**
     * Request timeouts
     */
    ajaxRequestTimeout: 7200000, // in milliseconds 2 hours
    gridRequestTimeout:  240000, // in milliseconds 4 minutes
    zipRequestTimeout:  3600000, // in milliseconds 1 hour

    /**
     * Texts of uploaders/downloaders
     */
    uploadSilverlightText: "<div id='{0}_ultimateUploaderRemarkSize' style='margin-top:4px;margin-left:4px;'>{1}</div><object id='{0}_ultimateUploader' data='data:application/x-silverlight-2,' type='application/x-silverlight-2' width='384' height='233'>\
<param name='source' value='{2}Uploaders/UltimateUploader.xap' />\
<param name='background' value='#FFFFFF' />\
<param name='minRuntimeVersion' value='4.0.50826.0' />\
<param name='autoUpgrade' value='true' />\
<param name='windowless' value='false' />\
<param name='onLoad' value='{0}_onSilverlightLoaded' />\
<param name='initParams' value='UploadHandler={3}Handlers/SilverlightUpload.ashx,AvailableView=Grid,ShowHelpButton=false,AllowFileComments=false,BackColor=#FFFFFF,LicenseKey=007171288621221222547282313621191371610182' />\
<a href='http://go.microsoft.com/fwlink/?LinkID=149156&v=4.0.50826.0' style='text-decoration: none'><img src='http://go.microsoft.com/fwlink/?LinkId=161376' alt='Get Microsoft Silverlight' style='border-style: none' /></a>\
</object>",
    uploadFlashText: "<div id='{0}_flashUploaderRemarkSize' style='margin-top:4px;margin-left:4px;'>{1}</div><OBJECT id='{0}_MultiPowUpload' codeBase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0' width='384' height='233' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' VIEWASTEXT>\
<PARAM NAME='FlashVars' VALUE='uploadUrl={2}Handlers/FlashUpload.ashx&backgroundColor=#DFE8F6&useExternalInterface=true&serialNumber=00817212818713928592547173282214927171810200&language.source={2}Localization/Uploaders/Flash/Language_{3}.xml&javaScriptEventsPrefix=HttpCommander.Main.FileManagers[\"{0}\"].MultiPowUpload'> \
<PARAM NAME='BGColor' VALUE='#FFFFFF'>\
<PARAM NAME='Movie' VALUE='{2}Uploaders/ElementITMultiPowUpload.swf'>\
<PARAM NAME='Src' VALUE='{2}Uploaders/ElementITMultiPowUpload.swf'>\
<PARAM NAME='WMode' VALUE='window'>\
<embed wmode='transparent' bgcolor='#FFFFFF' id='{0}_MultiPowUpload' name='{0}_MultiPowUpload' src='{2}Uploaders/ElementITMultiPowUpload.swf' quality='high' pluginspage='http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash' type='application/x-shockwave-flash' width='384' height='233' flashvars='uploadUrl={2}Handlers/FlashUpload.ashx&backgroundColor=#DFE8F6&useExternalInterface=true&serialNumber=00817212818713928592547173282214927171810200&language.source={2}Localization/Uploaders/Flash/Language_{3}.xml&javaScriptEventsPrefix=HttpCommander.Main.FileManagers[\"{0}\"].MultiPowUpload'></embed>\
</OBJECT>",
    uploadAppletText: "<applet codebase='{0}' code='com.elementit.JavaPowUpload.Manager' \
archive='Uploaders/JavaPowUpload.jar, Uploaders/commons-logging-1.1.jar, Uploaders/commons-httpclient-3.1-rc1.jar, Uploaders/commons-codec-1.3.jar' \
width='376' height='207' name='{1}_javaPowUpload' id='{1}_javaPowUpload' mayscript='true' alt='JavaPowUpload by www.element-it.com' VIEWASTEXT>\
<param name='Common.SerialNumber' value='007244225132616185231718418015911722510183'>\
<param name='Common.UseLiveConnect' value='true'>\
<param name='Common.DetailsArea.Visible' value='true'>\
<param name='Common.InternationalFile' value='Localization/Uploaders/Java/Language_{2}.xml'>\
<param name='Upload.HttpUpload.FieldName.FilePath' value='SelectedPath_#COUNTER#'>\
<param name='Upload.HttpUpload.MaxFilesCountPerRequest' value='50'>\
<param name='Upload.HttpUpload.ExpectContinueHeader' value='false'>\
<param name='Upload.HttpUpload.SendTestRequest' value='true'>\
<param name='Common.UploadMode' value='true'>\
<param name='progressbar' value='true'>\
<param name='Common.ListArea.BackgroundImageUrl' value='/icons/drop.png'>\
<param name='boxmessage' value='Loading JavaPowUpload Applet ...'>\
<param name='Upload.UploadUrl' value='Handlers/JavaUpload.ashx'>\
<param name='Common.JavaScriptEventsPrefix' value='JavaPowUpload_'>\
<param name='Common.JavaScriptEventsContext' value='HttpCommander.Main.FileManagers[\"{1}\"]'>\
<span style='border:1px solid #FF0000;display:block;padding:5px;margin-top:10px;margin-bottom:10px;text-align:left; background: #FDF2F2;color:#000;'>You should <b>enable applets</b> running at browser and to have the <b>Java</b> (JRE) version &gt;= 1.5.<br />If applet is not displaying properly, please check <a target='_blank' href='http://java.com/en/download/help/testvm.xml' title='Check Java applets'>additional configurations</a></span>\
</applet>",
    uploadAppletTextEx: "<applet codebase='{0}' code='com.elementit.JavaPowUpload.Manager' \
archive='Uploaders/JavaPowUpload.jar, Uploaders/commons-logging-1.1.jar, Uploaders/commons-httpclient-3.1-rc1.jar, Uploaders/commons-codec-1.3.jar' \
width='376' height='207' name='{1}_javaPowUpload' id='{1}_javaPowUpload' mayscript='true' alt='JavaPowUpload by www.element-it.com' VIEWASTEXT>\
<param name='Common.SerialNumber' value='007244225132616185231718418015911722510183'>\
<param name='Common.UseLiveConnect' value='true'>\
<param name='Common.DetailsArea.Visible' value='true'>\
<param name='Common.InternationalFile' value='Localization/Uploaders/Java/Language_{2}.xml'>\
<param name='Upload.HttpUpload.FieldName.FilePath' value='SelectedPath_#COUNTER#'>\
<param name='Upload.HttpUpload.MaxFilesCountPerRequest' value='-1'>\
<param name='Upload.HttpUpload.ExpectContinueHeader' value='false'>\
<param name='Upload.HttpUpload.SendTestRequest' value='true'>\
<param name='Common.UploadMode' value='true'>\
<param name='progressbar' value='true'>\
<param name='boxmessage' value='Loading JavaPowUpload Applet ...'>\
<param name='Common.ListArea.BackgroundImageUrl' value='/icons/drop.png'>\
<param name='Upload.UploadUrl' value='Handlers/JavaUploadEx.ashx'>\
<param name='Common.JavaScriptEventsPrefix' value='JavaPowUpload_'>\
<param name='Common.JavaScriptEventsContext' value='HttpCommander.Main.FileManagers[\"{1}\"]'>\
<param name='Upload.HttpUpload.ChunkedUpload.Enabled' value='true'>\
<param name='Upload.HttpUpload.ChunkedUpload.ChunkSize' value='-1'>\
<param name='Upload.HttpUpload.ChunkedUpload.MaxChunkSize' value='2097152'>\
<param name='Common.RetryWhenConnectionLost' value='true'> \
<param name='Common.RetryWhenConnectionLost.CheckInterval' value='1'>\
<param name='Common.RetryWhenConnectionLost.CheckTimeout' value='600'>\
<span style='border:1px solid #FF0000;display:block;padding:5px;margin-top:10px;margin-bottom:10px;text-align:left; background: #FDF2F2;color:#000;'>You should <b>enable applets</b> running at browser and to have the <b>Java</b> (JRE) version &gt;= 1.5.<br />If applet is not displaying properly, please check <a target='_blank' href='http://java.com/en/download/help/testvm.xml' title='Check Java applets'>additional configurations</a></span>\
</applet>",
    downloadAppletText: "<applet codebase='{0}' code='com.elementit.JavaPowUpload.Manager' \
archive='Uploaders/JavaPowUpload.jar, Uploaders/commons-logging-1.1.jar, Uploaders/commons-httpclient-3.1-rc1.jar, Uploaders/commons-codec-1.3.jar' \
width='344' height='206' name='{1}_javaPowDownload' id='{1}_javaPowDownload' mayscript='true' alt='JavaPowUpload by www.element-it.com' VIEWASTEXT>\
<param name='Common.SerialNumber' value='007244225132616185231718418015911722510183'>\
<param name='Common.UseLiveConnect' value='true'>\
<param name='Common.DownloadMode' value='true'>\
<param name='Common.InternationalFile' value='Localization/Uploaders/Java/Language_{2}.xml'>\
<param name='progressbar' value='true'>\
<param name='boxmessage' value='Loading JavaPowUpload Applet ...'>\
<param name='Download.DataURL' value='Handlers/Download.ashx'>\
<param name='Download.UseHeadMethodToGetFileLength' value='true'>\
<param name='Common.JavaScriptEventsPrefix' value='JavaPowDownload_'>\
<param name='Common.JavaScriptEventsContext' value='HttpCommander.Main.FileManagers[\"{1}\"]'>\
<span style='border:1px solid #FF0000;display:block;padding:5px;margin-top:10px;margin-bottom:10px;text-align:left; background: #FDF2F2;color:#000;'>You should <b>enable applets</b> running at browser and to have the <b>Java</b> (JRE) version &gt;= 1.5.<br />If applet is not displaying properly, please check <a target='_blank' href='http://java.com/en/download/help/testvm.xml' title='Check Java applets'>additional configurations</a></span>\
</applet>",

    /**
     * Other constants
     */
    
    browserContextMenuTypes: ['textarea', 'text'],

    needInstallAdobeFlashPlayerMessage:
        "<table width='100%' cellpadding='0' cellspacing='0' border='0' align='center'><tr><td><span style='border:1px solid #FF0000;display:block;padding:5px;background:#FDF2F2;color:#000;'>" +
        "You should install and-or enable in browser a <a target='_blank' href='http://www.adobe.com/go/getflashplayer'><b>Adobe Flash Player</b></a> of the last version.</span></td></tr></table>"
};

// All supported file types for MS Office
HttpCommander.Lib.Consts.msoSupportedtypes = ';' + (
    HttpCommander.Lib.Consts.msoTypesOnlyForSharePointLauncher + ';' +
    // MS Access only read-only on Edit in MS Office
    //HttpCommander.Lib.Consts.msoAccessTypes + ';' +
    HttpCommander.Lib.Consts.msoExcelTypes + ';' +
    HttpCommander.Lib.Consts.msoOutlookTypes + ';' +
    HttpCommander.Lib.Consts.msoPowerTypes + ';' +
    HttpCommander.Lib.Consts.msoWordTypes + ';' +
    HttpCommander.Lib.Consts.msoFrontPageTypes+ ';' +
    HttpCommander.Lib.Consts.msoInfoPathTypes+ ';' +
    HttpCommander.Lib.Consts.msoPubTypes+ ';' +
    HttpCommander.Lib.Consts.msoVisioTypes+ ';' +
    HttpCommander.Lib.Consts.msoProjectTypes
).replace(/,/g, ';') + ';';

// HTML5 video file types
HttpCommander.Lib.Consts.html5VideoFileTypes = HttpCommander.Lib.Consts.videoConvertFileTypes;

// ActiveXObjects for MS Office applications
HttpCommander.Lib.Consts.ActiveXMSOfficeApplications = {
    'Word': {
        app: 'Word.Application',
        obj: 'Documents'
    },
    'Excel': {
        app: 'Excel.Application',
        obj: 'Workbooks'
    },
    'PowerPoint': {
        app: 'PowerPoint.Application',
        obj: 'Presentations'
    }
};

HttpCommander.Lib.Consts.CloudNames = {
    google: 'Google Drive',
    dropbox: 'Dropbox',
    onedrive: 'OneDrive',
    box: 'Box',
    onedriveforbusiness: 'OneDrive for Business',
    office365: 'Office 365'
};
