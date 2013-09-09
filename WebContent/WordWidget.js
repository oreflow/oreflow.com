$(function() {
    // the widget definition, where "custom" is the namespace,
    // "colorize" the widget name
    $.widget( "login.WordWidget", {
      // default options
      options: {
    	  posX: 0.0,
          posY: 0.0,
          speedX: 1,
          speedY: 1,
    	  content:"",
    	  dragged: false,
    	  enabled: true,
    	  width: 200,
    	  height: 50,
 
        // callbacks
        change: null,
        random: null
      },
 
      // the constructor
      _create: function() {
        this.element
          // add a class for theming
          .addClass( "word" )
          // prevent double click to select text
          .disableSelection()
          .css("position:absolute;");
        

 
        /*
        this.changer = $( "<button>", {
          text: "change",
          "class": "custom-colorize-changer"
        })
        .appendTo( this.element )
        .button();
         
        // bind click events on the changer button to the random method
        this._on( this.changer, {
          // _on won't call random when widget is disabled
          click: "random"
        });
        */
        this._refresh();
      },
 
      // called when created, and later when changing options
      _refresh: function() {
    	  this.element.css( 'position','absolute')
    	  .css('left',Math.floor(this.options.posX) + 'px')
    	  .css('top',Math.floor(this.options.posY) + 'px');
    	  // trigger a callback/event
    	  this._trigger( "change" );
      },
 
      // a public method to change the color to a random value
      // can be called directly via .WordWidget( "random" )
      random: function() {
    	  var tmp = Math.floor(Math.random() * 4);
    	  switch(tmp)
    	  {
    	  case 0: this.options.speedX = 1;this.options.speedY = 1; break;
    	  case 1: this.options.speedX = 1;this.options.speedY = -1; break;
    	  case 2: this.options.speedX = -1;this.options.speedY = 1; break;
    	  case 3: this.options.speedX = -1;this.options.speedY = -1; break;
    	  default: this.options.speedX = -1;this.options.speedY = -1; break;
    	  }
    	  this.options.posX = 10 + Math.floor( Math.random() * (document.width - this.options.width - 20) );
    	  this.options.posY =  60 + Math.floor( Math.random() * (document.height - 50 - 20 - 50));
    	  
          this.options.width = this.element.outerWidth();
          this.options.height = this.element.outerHeight();
          //console.log(this.options.width);
    	  
      },
      // public function that triggers a move event that moves the widget 1 step in the defined direction
      // can be called directly via .WordWidget( "move" )
      move: function() {
    	  // do not move object if it is currently being dragged
    	  if(this.options.dragged)
    		  return;
    	  
    	  // if the object reaches one of the edges of the screen it should turn around...
    	  if(this.options.posX > (document.width - this.options.width - 20))
    		  this.options.speedX = -1;
    	  if(this.options.posX < 20)
    		  this.options.speedX = 1;
    	  if(this.options.posY > (document.height- this.options.height - 20))
    		  this.options.speedY = -1;
    	  if(this.options.posY < 70)
    		  this.options.speedY = 1;
    	  
    	  
    	  
    	  // if the widget does not overlap the middle square
    	  if ((this.options.posX + this.options.width) < ((document.width/2) - 80) ||
			  this.options.posX > ((document.width/2) + 80) ||
			  (this.options.posY + this.options.height) < ((document.height/2) - 80) || 
			  this.options.posY > ((document.height/2) + 80))
		  {
		  }
    	  else
		  {
    		  console.log(this.options.content);
    		  var mid = [this.options.posX + this.options.width/2, this.options.posY + this.options.height/2];
    		  var dx = (mid[0] - (document.width/2));
    		  var dy = (mid[1] - (document.height/2));
    		  
    		  if(dx > 0 && dy > 0)
			  {
	    		  if(Math.abs(dx) > Math.abs(dy))
	    			  this.options.speedX = 1;
	    		  else
	    			  this.options.speedY = 1;
			  }
    		  else if(dx < 0 && dy > 0)
			  {
	    		  if(Math.abs(dx) > Math.abs(dy))
	    			  this.options.speedX = -1;
	    		  else
	    			  this.options.speedY = 1;
			  }
    		  else if(dx > 0 && dy < 0)
			  {
	    		  if(Math.abs(dx) > Math.abs(dy))
	    			  this.options.speedX = 1;
	    		  else
	    			  this.options.speedY = -1;
			  }
    		  else if(dx < 0 && dy < 0)
			  {
	    		  if(Math.abs(dx) > Math.abs(dy))
	    			  this.options.speedX = -1;
	    		  else
	    			  this.options.speedY = -1;
			  }
    		  
		  }
    	  
    	     	  
    	  
          var coords = {
            posX: this.options.posX + this.options.speedX,
            posY: this.options.posY + this.options.speedY,
          };
          
          
          // trigger an event, check if it's canceled
          if ( this._trigger( "random", event, coords ) !== false ) {
            this.option( coords );
          }
          
        },
        // Triggered when the widget is being dragged
        start: function(ui) {
        	  this.options.dragged = true;
          },
          // Triggered when the dragging is finished and the object is released
        stop: function(ui) {
      	  
        	
            var coords = {
              posX: ui.position.left,
              posY: ui.position.top,
            };
            
            
            // trigger an event, check if it's canceled
            if ( this._trigger( "random", event, coords ) !== false ) {
              this.option( coords );
            }
            this.options.dragged = false;
            
          },
          
          toString: function() {
        	  return content;
            },
       enabled: function(bool) {
    	   this.options.enabled = bool;
    	   if(!bool)
    		   this.element.css('visibility', 'hidden');
    	   else
    		   this.element.css('visibility', 'visible');
            },
 
      // events bound via _on are removed automatically
      // revert other modifications here
      _destroy: function() {
        // remove generated elements
        this.changer.remove();
 
        this.element
          .removeClass( "word" )
          .enableSelection();
      },
 
      // _setOptions is called with a hash of all options that are changing
      // always refresh when changing options
      _setOptions: function() {
        // _super and _superApply handle keeping the right this-context
        this._superApply( arguments );
        this._refresh();
      },
 
      // _setOption is called for each individual option that is changing
      _setOption: function( key, value ) {
        // prevent invalid color values
        if ( key == "posX" && (value < 0 || value > screen.width) ) {
          return;
        }
        if ( key == "posY" && (value < 0 || value > screen.height) ) {
            return;
        }
        this._super( key, value );
      }
    });
  });