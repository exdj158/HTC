set OLDDIR=%CD%

cd /D %1

set CMDJS=java -jar yuicompressor-2.4.8.jar --line-break 0 --type js --charset utf-8 -o
echo Compress js files...
set JSPATH=Scripts\
copy /y /b ^
 "%JSPATH%Lib\ExtOverrides.js"^
+"%JSPATH%Lib\Message.js"^
+"%JSPATH%Lib\Window.js"^
+"%JSPATH%Lib\Consts.js"^
+"%JSPATH%Lib\Utils.js"^
+"%JSPATH%Lib\PlayVideoFlashWindow.js"^
+"%JSPATH%Lib\PlayVideoHtml5Window.js"^
+"%JSPATH%Lib\PlayVideoJSWindow.js"^
+"%JSPATH%Lib\PlayAudioHtml5Window.js"^
+"%JSPATH%Lib\VideoConvertProgressWindow.js"^
+"%JSPATH%Lib\VideoConvertWindow.js"^
+"%JSPATH%Lib\ShortcutWindow.js"^
+"%JSPATH%Lib\LinkToFileFolderWindow.js"^
+"%JSPATH%Lib\ViewLinksWindow.js"^
+"%JSPATH%Lib\DataRenderers.js"^
+"%JSPATH%Lib\DetailsPane.js"^
+"%JSPATH%Lib\ThumbView.js"^
+"%JSPATH%Lib\CreatePublicLinkWindow.js"^
+"%JSPATH%Lib\LinksToWebFoldersWindow.js"^
+"%JSPATH%Lib\MailingGroupsWindow.js"^
+"%JSPATH%Lib\SendEmailWindow.js"^
+"%JSPATH%Lib\CheckInWindow.js"^
+"%JSPATH%Lib\VersionHistoryWindow.js"^
+"%JSPATH%Lib\ZipPromptWindow.js"^
+"%JSPATH%Lib\UnzipPromptWindow.js"^
+"%JSPATH%Lib\ZipContentWindow.js"^
+"%JSPATH%Lib\DownloadWindow.js"^
+"%JSPATH%Lib\FileModificationsWindow.js"^
+"%JSPATH%Lib\MetadataWindow.js"^
+"%JSPATH%Lib\MetadataWindowParts.js"^
+"%JSPATH%Lib\EditTextFileWindow.js"^
+"%JSPATH%Lib\UserHelpWindow.js"^
+"%JSPATH%Lib\SyncWebFoldersHelpWindow.js"^
+"%JSPATH%Lib\TreeLoader.js"^
+"%JSPATH%Lib\TreePanel.js"^
+"%JSPATH%Lib\FolderSelectionDialog.js"^
+"%JSPATH%Lib\Clipboard.js"^
+"%JSPATH%Lib\MenuActions.js"^
+"%JSPATH%Lib\GoogleDriveAuth.js"^
+"%JSPATH%Lib\GoogleDrive.js"^
+"%JSPATH%Lib\SkyDriveAuth.js"^
+"%JSPATH%Lib\SkyDrive.js"^
+"%JSPATH%Lib\DropboxAuth.js"^
+"%JSPATH%Lib\Dropbox.js"^
+"%JSPATH%Lib\BoxAuth.js"^
+"%JSPATH%Lib\Box.js"^
+"%JSPATH%Lib\ImageViewerWindow.js"^
+"%JSPATH%Lib\Html5ChunkedUpload.js"^
+"%JSPATH%Lib\SimpleUpload.js"^
+"%JSPATH%Lib\DragAndDropUpload.js"^
+"%JSPATH%Lib\DragAndDropZone.js"^
+"%JSPATH%Lib\JavaUpload.js"^
+"%JSPATH%Lib\FlashUpload.js"^
+"%JSPATH%Lib\SilverlightUpload.js"^
+"%JSPATH%Lib\UploadFromUrl.js"^
+"%JSPATH%Lib\iOSUpload.js"^
+"%JSPATH%Lib\UploadWindow.js"^
+"%JSPATH%Lib\OfficeEditor.js"^
+"%JSPATH%Lib\NewSubMenu.js"^
+"%JSPATH%Lib\ViewEditSubMenu.js"^
+"%JSPATH%Lib\ShareSubMenu.js"^
+"%JSPATH%Lib\CloudConvertWindow.js"^
+"%JSPATH%Lib\CloudStoragesSubMenu.js"^
+"%JSPATH%Lib\TrashSubMenu.js"^
+"%JSPATH%Lib\VersioningSubMenu.js"^
+"%JSPATH%Lib\LabelsMenu.js"^
+"%JSPATH%Lib\MoreSubMenu.js"^
+"%JSPATH%Lib\FileMenu.js"^
+"%JSPATH%Lib\AnonymContextMenu.js"^
+"%JSPATH%Lib\FlashViewerWindow.js"^
+"%JSPATH%Lib\FileSearchWindow.js"^
+"%JSPATH%Lib\ToolbarActions.js"^
+"%JSPATH%Lib\ControlNavFolders.js"^
+"%JSPATH%Lib\FavoritesSubMenu.js"^
+"%JSPATH%Lib\ActivityMonitor.js"^
+"%JSPATH%Lib\WatchSubMenu.js"^
+"%JSPATH%Lib\WatchModificationsWindow.js"^
+"%JSPATH%Lib\ChangesWatchWindow.js"^
+"%JSPATH%Main-debug.js"^
 "%JSPATH%Main-debug-combined.js"

%CMDJS% %JSPATH%Main.js %JSPATH%Main-debug-combined.js
del /f /q "%JSPATH%Main-debug-combined.js"

copy /y /b ^
 "%JSPATH%Lib\ExtOverrides.js"^
+"%JSPATH%Lib\Utils.js"^
+"%JSPATH%Lib\AdminUserHelpWindow.js"^
+"%JSPATH%Lib\AdminEmailNotifications.js"^
+"%JSPATH%Lib\AdminPermissions.js"^
+"%JSPATH%Lib\AdminMisc.js"^
+"%JSPATH%Lib\AdminUpdate.js"^
+"%JSPATH%Lib\AdminUserFoldersWindow.js"^
+"%JSPATH%Lib\AdminDbMaintenance.js"^
+"%JSPATH%Admin-debug.js"^
 "%JSPATH%Admin-debug-combined.js"

%CMDJS% %JSPATH%Admin.js %JSPATH%Admin-debug-combined.js
del /f /q "%JSPATH%Admin-debug-combined.js"

%CMDJS% %JSPATH%error-handler.js %JSPATH%error-handler-debug.js

%CMDJS% %JSPATH%ext-mod.js %JSPATH%ext-mod-debug.js
rem %CMDJS% %JSPATH%ext-all.js %JSPATH%ext-all-debug.js
rem %CMDJS% %JSPATH%ext-base.js %JSPATH%ext-base-debug.js

echo Compress anonymous Scripts...
%CMDJS% %JSPATH%anon.js %JSPATH%anon-debug.js

echo Compress js mobile files...
set JSMOBILEPATH=Scripts\mobile\
%CMDJS% %JSMOBILEPATH%main_jqm.js %JSMOBILEPATH%main_jqm-debug.js

echo Process sencha touch 2 files...
%CMDJS% %JSMOBILEPATH%st2\loader.js %JSMOBILEPATH%st2\loader-debug.js
copy /y %JSMOBILEPATH%touch2\build\package\HttpCommander\resources\css %JSMOBILEPATH%st2\resources\css
copy /y %JSMOBILEPATH%touch2\build\package\HttpCommander\app.js %JSMOBILEPATH%st2\app.js

rem echo Build sencha touch 2 inteface. Sencha command (at least version 4.0) should be installed .
rem echo Also Ruby required to compile sass styles. 1.9.3 version used
rem cd %JSMOBILEPATH%touch2\
rem build_package.bat
rem cd ..\..\..\

set CMDCSS=java -jar yuicompressor-2.4.8.jar --line-break 0 --type css --charset utf-8 -o
echo Compress css files...
set CSSPATH=Images\resources_1.5\css\
%CMDCSS% %CSSPATH%ext-all-min.css %CSSPATH%ext-all.css
%CMDCSS% %CSSPATH%ext-filters-min.css %CSSPATH%ext-filters.css
%CMDCSS% Styles-min.css Styles.css
%CMDCSS% %CSSPATH%ext-all-notheme-min.css %CSSPATH%ext-all-notheme.css
echo Compress anonymous css...
%CMDCSS% Images\css\anon-min.css Images\css\anon.css
echo Compress azzurra themes...
rem %CMDCSS% %CSSPATH%xtheme-azzurra-black.css %CSSPATH%azzurra-black.css
rem %CMDCSS% %CSSPATH%xtheme-azzurra-blue.css %CSSPATH%azzurra-blue.css
rem %CMDCSS% %CSSPATH%xtheme-azzurra-gray.css %CSSPATH%azzurra-gray.css
rem %CMDCSS% %CSSPATH%xtheme-azzurra-green.css %CSSPATH%azzurra-green.css
rem %CMDCSS% %CSSPATH%xtheme-azzurra-orange.css %CSSPATH%azzurra-orange.css
rem %CMDCSS% %CSSPATH%xtheme-azzurra-red.css %CSSPATH%azzurra-red.css
rem %CMDCSS% %CSSPATH%xtheme-access-min.css %CSSPATH%xtheme-access.css
rem %CMDCSS% %CSSPATH%xtheme-gray-min.css %CSSPATH%xtheme-gray.css

echo Compress js and css files successfully completed

chdir /d "%OLDDIR%"
