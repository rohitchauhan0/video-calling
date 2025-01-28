"use client"
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useRef , useEffect, use} from 'react';


function randomID(len) {
    let result = '';
    if (result) return result;
    var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
      maxPos = chars.length,
      i;
    len = len || 5;
    for (i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
  }

const Page = ({params}) => {
    const roomId = params.roomId
const containerRef = useRef(null);
    let myMeeting = async (element) => {
        // generate Kit Token
         const appID = 724274707;
         const serverSecret = "88cc5dda6eb5ce970dd1f5ed64f0fac2";
         const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId,  randomID(5),  randomID(5));
   
       
         const zp = ZegoUIKitPrebuilt.create(kitToken);
         zp.joinRoom({
           container: element,
           sharedLinks: [
             {
               name: 'Personal link',
               url:
                window.location.protocol + '//' + 
                window.location.host + window.location.pathname +
                 '?roomID=' +
                 roomId,
             },
           ],
           scenario: {
             mode: ZegoUIKitPrebuilt.GroupCall, 
           },
         });
     };

     useEffect(() => {
        if(!containerRef.current) return

        myMeeting(containerRef.current);
     }, [roomId]);
  return (
    <div style={{ width: '100%', height: '100vh' }} ref={containerRef}/>
  )
}

export default Page