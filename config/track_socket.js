const User = require('../models/user');

module.exports.trackSockets = function(socketServer)
{
    let io = require('socket.io')(socketServer);
    io.sockets.on('connection', function(socket){
        console.log('New Connection recieved',socket.id);

    socket.on('disconnect',function(){
        console.log('Socket Disconnected');
    });

    socket.on('join_room',function(data)
    {
        console.log('joining request recieved',data);

        socket.join(data.chatroom);
        io.in(data.chatroom).emit('user_joined',data);

    });

    socket.on('send_slot_status',async function(data)
    {
        console.log('joining request recieved',data);
        let staff = await User.findById(data.user_id);
            
        if(data.start)
            {
            var cname = [];
            var j=0;
            var a = data.seat; 
            var b = data.start;
            var b1 = b;
            var c = data.mindex;
            var x1 = c-(a-b);
            if(a == 10)
            {
                var s1 = a-b;
                while(s1!=0)
                {
                    let day = await User.update({ 'booking._id': staff.booking[x1+j]._id }, {
                        '$set': {
                            'booking.$.waiting': 'waiting'
                          //   'schedule_time.$.available': available,
                            
                        }
                    });
            
                    staff.tracked.push({
                    tid:staff.booking[x1+j]._id,
                    seat:b1++,
                    time:new Date(),
                    name:staff.booking[x1+j].name,
                    status:'Waiting',
                    slot:data.slot
                })
                cname.push(staff.booking[x1+j].name);
                j++;
                s1--;
                }
            }
            for(var k=b;k<a;k++)
            {
                let day = await User.update({ 'booking._id': staff.booking[x1+j]._id }, {
                    '$set': {
                        'booking.$.waiting': 'waiting'
                      //   'schedule_time.$.available': available,
                        
                    }
                });
                

            
                staff.tracked.push({
                    tid:staff.booking[x1+j]._id,
                    seat:k,
                    time:new Date(),
                    name:staff.booking[x1+j].name,
                    status:'Waiting',
                    slot:data.slot
                })
                cname.push(staff.booking[x1+j].name);
                j++;
            
            }
            console.log('hello')
            staff.tracked.push({
                tid:data.tid,
                seat:data.seat,
                time:new Date(),
                name:data.name,
                status:data.status,
                slot:data.slot
            })
    
            staff.save();

            io.in(data.chatroom).emit('receive_slot_status',{data,cname});

        }

        else{

            if(data.status == 'Waiting')
            {
                let day = await User.update({ 'tracked.tid': data.tid }, {
                    '$set': {
                        'tracked.$.status': 'ongoing'
                      //   'schedule_time.$.available': available,
                        
                    }
                });

                let day1 = await User.update({ 'booking._id': data.tid }, {
                    '$set': {
                        'booking.$.waiting': 'nowaiting'
                      //   'schedule_time.$.available': available,
                        
                    }
                });
            

               
                io.in(data.chatroom).emit('receive_slot_status',data);

            }

            else{
                staff.tracked.push({
                    tid:data.tid,
                    seat:data.seat,
                    time:new Date(),
                    name:data.name,
                    status:data.status,
                    slot:data.slot
                })
        
                staff.save();
    
                io.in(data.chatroom).emit('receive_slot_status',data);

            }

        }

        

    });



    socket.on('send_status', async function(data)
    {
     let staff = await User.findById(data.user_id);
            
        if(data.start)
            {
            var cname = [];
            var j=0;
            var a = data.seat; 
            var b = data.start;
            var b1 = b;
            var c = data.mindex;
            var x1 = c-(a-b);
            if(a == 10)
            {
                var s1 = a-b;
                while(s1!=0)
                {
                    let day = await User.update({ 'booking._id': staff.booking[x1+j]._id }, {
                        '$set': {
                            'booking.$.waiting': 'waiting'
                          //   'schedule_time.$.available': available,
                            
                        }
                    });
            
                    staff.tracked.push({
                    tid:staff.booking[x1+j]._id,
                    seat:b1++,
                    time:new Date(),
                    name:staff.booking[x1+j].name,
                    status:'Waiting'
                })
                cname.push(staff.booking[x1+j].name);
                j++;
                s1--;
                }
            }
            for(var k=b;k<a;k++)
            {
                let day = await User.update({ 'booking._id': staff.booking[x1+j]._id }, {
                    '$set': {
                        'booking.$.waiting': 'waiting'
                      //   'schedule_time.$.available': available,
                        
                    }
                });
                

            
                staff.tracked.push({
                    tid:staff.booking[x1+j]._id,
                    seat:k,
                    time:new Date(),
                    name:staff.booking[x1+j].name,
                    status:'Waiting'
                })
                cname.push(staff.booking[x1+j].name);
                j++;
            
            }
            console.log('hello')
            staff.tracked.push({
                tid:data.tid,
                seat:data.seat,
                time:new Date(),
                name:data.name,
                status:data.status
            })
    
            staff.save();

            io.in(data.chatroom).emit('receive_status',{data,cname});

        }

        else{

            if(data.status == 'Waiting')
            {
                let day = await User.update({ 'tracked.tid': data.tid }, {
                    '$set': {
                        'tracked.$.status': 'ongoing'
                      //   'schedule_time.$.available': available,
                        
                    }
                });

                let day1 = await User.update({ 'booking._id': data.tid }, {
                    '$set': {
                        'booking.$.waiting': 'nowaiting'
                      //   'schedule_time.$.available': available,
                        
                    }
                });
            

               
                io.in(data.chatroom).emit('receive_status',data);

            }

            else{
                staff.tracked.push({
                    tid:data.tid,
                    seat:data.seat,
                    time:new Date(),
                    name:data.name,
                    status:data.status
                })
        
                staff.save();
    
                io.in(data.chatroom).emit('receive_status',data);

            }

        }
    });
});

}