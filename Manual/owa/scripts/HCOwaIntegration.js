/**
 * Search in
 *   addrbook.js, cntedt.js, ctsvw.js,
 *   fldmgt.js, itmmv.js, msgedit.js, msglst.js,
 *   msgrd.js, mtgrd.js, opt.js, wrhead.js
 * files (in folder %EXCHANGEINSTALLPATH%ClientAccess\Owa\<%EXCHANGEVERSION%|current>\scripts\basic\)
 * next substring
 *   window.onload=function(){
 * and paste after founded substring unit3 for both files.
 * For the debug purposes it is possible to remove comments for
 *   alert(e)
 * in unit3
 */

/* Begin include HttpCommander unit3 */try{HttpCommander.Owa.Basic.insert()}catch(e){/*alert(e)*/};/* End include HttpCommander unit3 */


/**
 * Search in
 *   %EXCHANGEINSTALLPATH%ClientAccess\Owa\<%EXCHANGEVERSION%|current>\scripts\premium\uglobal.js
 * next string
 *   checkScripts()}
 * and paste between 'checkScripts()' and '}' unit4.
 * For the debug purposes it is possible to remove comments for
 *   alert(e)
 * in unit4
 */
 
/* Begin include HttpCommander unit4 */;try{HttpCommander.Owa.Premium.insert()}catch(e){/*alert(e)*/}/* End include HttpCommander unit4 */


/**
 * Search in startpage.js and unav.js files
 * (in folder %EXCHANGEINSTALLPATH%ClientAccess\Owa\<%EXCHANGEVERSION%|current>\scripts\premium\)
 * next substring
 *   positionMailboxQuotaBar()}function clearNwMB(){
 * and paste between 'positionMailboxQuotaBar()' and '}function clearNwMB(){' unit5
 * for both files.
 * For the debug purposes it is possible to remove comments for
 *   alert(e)
 * in unit5
 */
 
 /* Begin include HttpCommander unit5 */;try{HttpCommander.Owa.Premium.hide(arguments[0])}catch(e){/*alert(e)*/}/* End include HttpCommander unit5 */