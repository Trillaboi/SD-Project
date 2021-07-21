var ipc = require("node-ipc");


//  ipc.connectTo(
//   'little',
//   function(){
//     ipc.of.little.on(
//       'hello',
//       function(data){
//         ipc.log(data.debug)
//       }
//     )
//   }
// )

  ipc.serve();

// ipc.connectTo(
//     'world',
//     'myapp.3471'
// );


// ipc.connectTo(
//         'world',
//         function(){
//             ipc.of.world.on(
//                 'hello',
//                 function(data){
//                     ipc.log(data.debug);
//                     //if data was a string, it would have the color set to the debug style applied to it
//                 }
//             )
//         }
//     );
