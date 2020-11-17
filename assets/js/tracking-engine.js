

class PatientTracking{
    constructor(trackId, userId, userName, slots){
        this.slots = slots;
        console.log(slots);
        this.trackId = $(`#${trackId}`);
        this.userId = userId;
        this.userName = userName;

        this.socket = io.connect('http://localhost:5000')
        // this.socket = io.connect('http://aarogyahub.com:5000');

        if(this.userId)
        {
            this.connectionHandler();
        }
    }

    connectionHandler(){
        let self = this;
        this.socket.on('connect',function()
        {
            console.log('Connection established using sockets');
            self.socket.emit('join_room',{
                user_id:self.userId,
                user_name:self.userName,
                chatroom:'pts'
            });

            self.socket.on('user_joined',function(data)
            {
                console.log(`${data.user_name} has joined the patient tracking system.`,data);
            });
        
        
        });

        if(self.slots>1)
        {
            var ar = [];
      
            for(let i=0;i<self.slots;i++)
            {
                ar.push(eval('document.querySelectorAll("#updateStatus'+i+'")' + ';'));              
                              

            }

                for(let i = 0;i<ar.length;i++)
                {
                    for(let j = 0;j<ar[i].length;j++)
                    {
                        ar[i][j].addEventListener('click',function(e){
                            e.preventDefault();
            
                            if(ar[i][j].getAttribute('data-waiting') == 'waiting')
                            {
                                let tid = ar[i][j].getAttribute('data-tid');
                                let seat = ar[i][j].getAttribute('data-count');
                                let name = ar[i][j].getAttribute('data-name');
                                self.socket.emit('send_slot_status',{
                                    seat:seat,
                                    tid:tid,
                                    user_id:self.userId,
                                    chatroom:'pts',
                                    index:j,
                                    status:'Waiting',
                                    wcount : ar[i][j].getAttribute('data-waiting-count'),
                                    name:name,
                                    slot:i
                                });
                            }
            
                            else{
                                    let n1 = ar[i][j].getAttribute('data-slot');//3
                                    let upcomingli = document.querySelectorAll(`.upcoming-li${n1}`);
                                    let firstli = upcomingli[0].getAttribute('data-index');//1
                                    let seat = ar[i][j].getAttribute('data-count');//3
                                    console.log(firstli,seat);
                                    
                                    if(firstli == seat)
                                    {
                                        let tid = ar[i][j].getAttribute('data-tid');
                                        let name = ar[i][j].getAttribute('data-name');
                                    
                                        
                                            self.socket.emit('send_slot_status',{
                                                seat:seat,
                                                tid:tid,
                                                user_id:self.userId,
                                                chatroom:'pts',
                                                index:j,
                                                status:'ongoing',
                                                name:name,
                                                slot:i
                                            });
                                        
                                    }
            
                                    else{
                                        let tid = ar[i][j].getAttribute('data-tid');
                                        let name = ar[i][j].getAttribute('data-name');
                                        let mindex = ar[i][j].getAttribute('data-mindex');
                                        let ss=0;
                                        for(let k = firstli-1;k<seat-1;k++)
                                        {
                                            ar[i][k].setAttribute("data-waiting", "waiting");
                                            ar[i][k].setAttribute("data-waiting-count", ss);
                                            ss++;
                                        }
            
                                        
                                            self.socket.emit('send_slot_status',{
                                                seat:seat,
                                                tid:tid,
                                                user_id:self.userId,
                                                chatroom:'pts',
                                                index:j,
                                                start:firstli,
                                                mindex:mindex,
                                                status:'ongoing',
                                                name:name,
                                                slot:i
                                            });
                                    }
            
                        }
            
                           
                        });
                    }
                   
            
                }
            
        }

        else{
            var trackButton = document.querySelectorAll('#updateStatus');
            for(let i = 0;i<trackButton.length;i++)
            {
                trackButton[i].addEventListener('click',function(e){
                    e.preventDefault();
    
                    if(trackButton[i].getAttribute('data-waiting') == 'waiting')
                    {
                        let tid = trackButton[i].getAttribute('data-tid');
                        let seat = trackButton[i].getAttribute('data-count');
                        let name = trackButton[i].getAttribute('data-name');
                        self.socket.emit('send_status',{
                            seat:seat,
                            tid:tid,
                            user_id:self.userId,
                            chatroom:'pts',
                            index:i,
                            status:'Waiting',
                            name:name
                        });
                    }
    
                    else{
                            var upcomingli = document.querySelectorAll('.upcoming-li');
                            let firstli = upcomingli[0].getAttribute('data-index');//1
                            let seat = trackButton[i].getAttribute('data-count');//3
                            console.log(firstli,seat);
                            
                            if(firstli == seat)
                            {
                                let tid = trackButton[i].getAttribute('data-tid');
                                let name = trackButton[i].getAttribute('data-name');
                            
                                
                                    self.socket.emit('send_status',{
                                        seat:seat,
                                        tid:tid,
                                        user_id:self.userId,
                                        chatroom:'pts',
                                        index:i,
                                        status:'ongoing',
                                        name:name
                                    });
                                
                            }
    
                            else{
                                let tid = trackButton[i].getAttribute('data-tid');
                                let name = trackButton[i].getAttribute('data-name');
                                let mindex = trackButton[i].getAttribute('data-mindex');
                                for(let j = firstli-1;j<seat-1;j++)
                                {
                                    trackButton[j].setAttribute("data-waiting", "waiting");
                                }
    
                                
                                    self.socket.emit('send_status',{
                                        seat:seat,
                                        tid:tid,
                                        user_id:self.userId,
                                        chatroom:'pts',
                                        index:i,
                                        start:firstli,
                                        mindex:mindex,
                                        status:'ongoing',
                                        name:name
                                    });
                            }
    
                }
    
                   
                });
        
            }
        }
   
       
       
        self.socket.on('receive_status',function(data){
            console.log('message recieved',data);

            if(data.cname){
                var trackButton = document.querySelectorAll('#updatedStatus1');
                var tracked = document.querySelectorAll('#updatedStatus2');
      
                if(data.data.user_id==self.userId){
                   trackButton[data.data.index].classList.add('displayNone');
                   tracked[data.data.index].classList.remove('displayNone');
                }
               
                
                $( "#patient-ul li a" ).last().addClass( "displayNone" );
                $( "#patient-ul li h3" ).last().removeClass( "displayNone" );
    

                var j=1;
                for(let i=0;i<data.data.seat-data.data.start;i++)
                {
                    var t1 = parseInt(data.data.start)+i;
                    let newMessage = $('<li class="patient-li">');
    
                    var h4 = newMessage.append($('<h4>',{
                        'html':'<span><i class="fas fa-user-md"></i></span>Patient No. '+t1
                    }));
        
                    var h5 = h4.append($('<h5>',{
                        'html':data.cname[i]
                    }));
        
                    var a = h5.append($('<a class="displayNone uongoing">Ongoing</a>'));
                    
        
                    var h2 = a.append($('<h2 class="b_red uwaiting"><span><i class="fas fa-hourglass" aria-hidden="true" style="margin-right: 8px;"></i></span>Waiting</h2>'));
                    var h3 = h2.append($('<h3 class="displayNone uvisited"><span><i class="fas fa-child" aria-hidden="true" style="margin-right: 8px;"></i></span>Visited</h3>'));
                   

        
                    $('#patient-ul').append(newMessage); 
                    j++;

                }
                let upcomingsli = document.querySelectorAll('.upcoming-li'); 
                for(let i=0;i<=data.data.seat-data.data.start;i++)
                {
                   console.log(upcomingsli[i].getAttribute('data-index'));//1
                   upcomingsli[i].remove();

                }
                let newMessage = $('<li class="patient-li">');
    
                var h4 = newMessage.append($('<h4>',{
                    'html':'<span><i class="fas fa-user-md"></i></span>Patient No. '+data.data.seat
                }));
    
                var h5 = h4.append($('<h5>',{
                    'html':data.data.name
                }));
    
                var a = h5.append($('<a class = "uongoing" >Ongoing</a>'));
                var h2 = a.append($('<h2 class="b_red uwaiting displayNone"><span><i class="fas fa-hourglass" aria-hidden="true" style="margin-right: 8px;"></i></span>Waiting</h2>'));

    
                var h3 = h2.append($('<h3 class="displayNone uvisited"><span><i class="fas fa-child" aria-hidden="true" style="margin-right: 8px;"></i></span>Visited</h3>'));
    
                var date = new Date().toLocaleTimeString();
                var date1 = date.slice(0,5);
                var date2 = date.slice(8,11); 
                h3.append($('<p>',{
                    'html':'CheckIn Time : '+date1 +' '+ date2
                })); 

    
                $('#no_patient').last().addClass("displayNone");
               
    
                $('#patient-ul').append(newMessage);

            }

            else{

                if(data.status == 'Waiting')
                {
                
                   
                    var trackButton = document.querySelectorAll('#updatedStatus1');
                    var tracked = document.querySelectorAll('#updatedStatus2');
          
                    if(data.user_id == self.userId){
                       trackButton[data.index].classList.add('displayNone');
                       tracked[data.index].classList.remove('displayNone');
                    }

                    let activeongoing = document.querySelectorAll('.activeongoing');
                    let activevisited = document.querySelectorAll('.activevisit');
                    let l1 = activeongoing.length;
                    let l2 = activevisited.length;
                    if(l1>0 && l2>0)
                    {
                    console.log('u are there');
                    activeongoing[l1-1].classList.add('displayNone');
                    activevisited[l2-1].classList.remove('displayNone');
                    }

                    let waiting = document.querySelectorAll('.uwaiting');
                    let ongoing = document.querySelectorAll('.uongoing');
                    var visited = document.querySelectorAll('.uvisited');
                    waiting[data.index].classList.add('displayNone');
                    ongoing[data.index].classList.add('activeongoing');
                    visited[data.index].classList.add('activevisit');
                    ongoing[data.index].classList.remove('displayNone');
                 
                    $( "#patient-ul li a" ).last().addClass( "displayNone" );
                    $( "#patient-ul li h3" ).last().removeClass( "displayNone" );
                   }

                else{
                    let newMessage = $('<li class="patient-li">');
                    var trackButton = document.querySelectorAll('#updatedStatus1');
                    var tracked = document.querySelectorAll('#updatedStatus2');
          
                    if(data.user_id==self.userId){
                       trackButton[data.index].classList.add('displayNone');
                       tracked[data.index].classList.remove('displayNone');
                    }
        
                    var h4 = newMessage.append($('<h4>',{
                        'html':'<span><i class="fas fa-user-md"></i></span>Patient No. '+data.seat
                    }));
        
                    var h5 = h4.append($('<h5>',{
                        'html':data.name
                    }));
        
                    var a = h5.append($('<a class="uongoing">Ongoing</a>'));
                    
                    var h2 = a.append($('<h2 class="b_red uwaiting displayNone"><span><i class="fas fa-hourglass" aria-hidden="true" style="margin-right: 8px;"></i></span>Waiting</h2>'));



        
                    var h3 = h2.append($('<h3 class="uvisited displayNone"><span><i class="fas fa-child" aria-hidden="true" style="margin-right: 8px;"></i></span>Visited</h3>'));
        
                    var date = new Date().toLocaleTimeString();
                    var date1 = date.slice(0,5);
                    var date2 = date.slice(8,11); 
                    h3.append($('<p>',{
                        'html':'CheckIn Time : '+date1 +' '+ date2
                    })); 


                    let activeongoing = document.querySelectorAll('.activeongoing');
                    let activevisited = document.querySelectorAll('.activevisit');
                    let l1 = activeongoing.length;
                    let l2 = activevisited.length;
                    if(l1>0 && l2>0)
                    {
                    console.log('u are there');
                    activeongoing[l1-1].classList.add('displayNone');
                    activevisited[l2-1].classList.remove('displayNone');
                    }
        
                    $('#no_patient').last().addClass("displayNone");
                    $('.upcoming-ul li:first-child').remove();
                    $( "#patient-ul li a" ).last().addClass( "displayNone" );
                    $( "#patient-ul li h3" ).last().removeClass( "displayNone" );
        
        
                    $('#patient-ul').append(newMessage);
                }

           
        }
        });
        self.socket.on('receive_slot_status',function(data){
            console.log('message recieved',data);

            if(data.cname){
                var trackButton = document.querySelectorAll(`#updatedStatus1${data.data.slot}`);
                var tracked = document.querySelectorAll(`#updatedStatus2${data.data.slot}`);
      
                if(data.data.user_id==self.userId){
                   trackButton[data.data.index].classList.add('displayNone');
                   tracked[data.data.index].classList.remove('displayNone');
                }
               
                let upcomingsli = document.querySelectorAll(`.upcoming-li${data.data.slot}`);
                $( `#patient-ul${data.data.slot} li a` ).last().addClass( "displayNone" );
                $( `#patient-ul${data.data.slot} li h3` ).last().removeClass( "displayNone" );
    

                var j=1;
                for(let i=0;i<data.data.seat-data.data.start;i++)
                {
                    var t1 = parseInt(data.data.start)+i;
                    let newMessage = $('<li class="patient-li">');
    
                    var h4 = newMessage.append($('<h4>',{
                        'html':'<span><i class="fas fa-user-md"></i></span>Patient No. '+t1
                    }));
        
                    var h5 = h4.append($('<h5>',{
                        'html':data.cname[i]
                    }));
        
                    var a = h5.append($('<a class="displayNone uongoing'+data.data.slot+'">Ongoing</a>'));
                    
        
                    var h2 = a.append($('<h2 class="b_red uwaiting'+data.data.slot+'"><span><i class="fas fa-hourglass" aria-hidden="true" style="margin-right: 8px;"></i></span>Waiting</h2>'));
                    var h3 = h2.append($('<h3 class="displayNone uvisited'+data.data.slot+'"><span><i class="fas fa-child" aria-hidden="true" style="margin-right: 8px;"></i></span>Visited</h3>'));
                   

        
                    $(`#patient-ul${data.data.slot}`).append(newMessage); 
                    j++;

                }
                for(let i=0;i<=data.data.seat-data.data.start;i++)
                {
                   upcomingsli[i].remove();

                }
                let newMessage = $('<li class="patient-li">');
    
                var h4 = newMessage.append($('<h4>',{
                    'html':'<span><i class="fas fa-user-md"></i></span>Patient No. '+data.data.seat
                }));
    
                var h5 = h4.append($('<h5>',{
                    'html':data.data.name
                }));
    
                var a = h5.append($('<a class = "uongoing'+data.data.slot+'" >Ongoing</a>'));
                var h2 = a.append($('<h2 class="b_red uwaiting'+data.data.slot+' displayNone"><span><i class="fas fa-hourglass" aria-hidden="true" style="margin-right: 8px;"></i></span>Waiting</h2>'));

    
                var h3 = h2.append($('<h3 class="displayNone uvisited'+data.data.slot+'"><span><i class="fas fa-child" aria-hidden="true" style="margin-right: 8px;"></i></span>Visited</h3>'));
    
                var date = new Date().toLocaleTimeString();
                var date1 = date.slice(0,5);
                var date2 = date.slice(8,11); 
                h3.append($('<p>',{
                    'html':'CheckIn Time : '+date1 +' '+ date2
                })); 
                
    
                $(`#no_patient${data.data.slot}`).last().addClass("displayNone");
               
    
                $(`#patient-ul${data.data.slot}`).append(newMessage);
                let activeongoing = document.querySelectorAll(`.activeongoing${data.data.slot}`);
                let activevisited = document.querySelectorAll(`.activevisit${data.data.slot}`);
                let l1 = activeongoing.length;
                let l2 = activevisited.length;
                if(l1>0 && l2>0)
                {
               
                activeongoing[0].classList.add('displayNone');
                activevisited[0].classList.remove('displayNone');
                }


            }

            else{

                if(data.status == 'Waiting')
                {
                
                   
                    var trackButton = document.querySelectorAll(`#updatedStatus1${data.slot}`);
                    var tracked = document.querySelectorAll(`#updatedStatus2${data.slot}`);
          
                    if(data.user_id == self.userId){
                       trackButton[data.index].classList.add('displayNone');
                       tracked[data.index].classList.remove('displayNone');
                    }

                    let activeongoing = document.querySelectorAll(`.activeongoing${data.slot}`);
                    let activevisited = document.querySelectorAll(`.activevisit${data.slot}`);
                    let l1 = activeongoing.length;
                    let l2 = activevisited.length;
                    if(l1>0 && l2>0)
                    {
                    console.log('u are  now there');
                    activeongoing[data.wcount].classList.add('displayNone');
                    activevisited[data.wcount].classList.remove('displayNone');
                    }

                    let waiting = document.querySelectorAll(`.uwaiting${data.slot}`);
                    let ongoing = document.querySelectorAll(`.uongoing${data.slot}`);
                    var visited = document.querySelectorAll(`.uvisited${data.slot}`);
                    waiting[data.index].classList.add('displayNone');
                    ongoing[data.index].classList.add(`activeongoing${data.slot}`);
                    visited[data.index].classList.add(`activevisit${data.slot}`);
                    ongoing[data.index].classList.remove('displayNone');
                 
                    $( `#patient-ul${data.slot} li a` ).last().addClass( "displayNone" );
                    $( `#patient-ul${data.slot} li h3` ).last().removeClass( "displayNone" );
                   }

                else{
                    console.log(data);
                    let newMessage = $('<li class="patient-li">');
                    var trackButton = document.querySelectorAll(`#updatedStatus1${data.slot}`);
                    var tracked = document.querySelectorAll(`#updatedStatus2${data.slot}`);
          
                    if(data.user_id==self.userId){
                       trackButton[data.index].classList.add('displayNone');
                       tracked[data.index].classList.remove('displayNone');
                    }
        
                    var h4 = newMessage.append($('<h4>',{
                        'html':'<span><i class="fas fa-user-md"></i></span>Patient No. '+data.seat
                    }));
        
                    var h5 = h4.append($('<h5>',{
                        'html':data.name
                    }));
        
                    var a = h5.append($('<a class="uongoing'+data.slot+'">Ongoing</a>'));
                    
                    var h2 = a.append($('<h2 class="b_red uwaiting'+data.slot+' displayNone"><span><i class="fas fa-hourglass" aria-hidden="true" style="margin-right: 8px;"></i></span>Waiting</h2>'));



        
                    var h3 = h2.append($('<h3 class="uvisited'+data.slot+' displayNone"><span><i class="fas fa-child" aria-hidden="true" style="margin-right: 8px;"></i></span>Visited</h3>'));
        
                    var date = new Date().toLocaleTimeString();
                    var date1 = date.slice(0,5);
                    var date2 = date.slice(8,11); 
                    h3.append($('<p>',{
                        'html':'CheckIn Time : '+date1 +' '+ date2
                    })); 


                    let activeongoing = document.querySelectorAll(`.activeongoing${data.slot}`);
                    let activevisited = document.querySelectorAll(`.activevisit${data.slot}`);
                    let l1 = activeongoing.length;
                    let l2 = activevisited.length;
                    if(l1>0 && l2>0)
                    {
                    console.log('u are there');
                    activeongoing[0].classList.add('displayNone');
                    activevisited[0].classList.remove('displayNone');
                    }
        
                    $(`#no_patient${data.slot}`).last().addClass("displayNone");
                    $(`.upcoming-ul${data.slot} li:first-child`).remove();
                    $( `#patient-ul${data.slot} li a` ).last().addClass( "displayNone" );
                    $( `#patient-ul${data.slot} li h3` ).last().removeClass( "displayNone" );
        
        
                    $(`#patient-ul${data.slot}`).append(newMessage);
                }

           
        }
        });
    }

   
}