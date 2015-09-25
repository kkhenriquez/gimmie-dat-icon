/*jslint browser: true*/
/*global $, jQuery, alert*/

var Gimmie = {
  $content: $('.content'),
  $form: $('form'),
  
  toggleLoading: function () {
    'use strict';
  //Toggle loading indicator
    this.$content.toggleClass('content--loading');
  
  // Toggle the submit button so we don't get double submissions
        // http://stackoverflow.com/questions/4702000/toggle-input-disabled-attribute-using-jquery
    this.$form.find('button').prop('disabled', function (i, v) { return !v; });
  },
  
  userInput: '',
  userInputIsValid: false,
  appId: '',
  validate: function () {
    'use strict';
    var regUrl = /^(http|https):\/\/itunes/i,
      regId = /\/id(\d+)/i,
      id;
    if (regUrl.test(this.userInput) && regId.test(this.userInput)) {
      this.userInputIsValid = true;
      id = regId.exec(this.userInput);
      this.appId = id[1];
    } else {
      this.userInputIsValid = false;
      this.appId = '';
    }
  },
  
  throwError: function (header, text) {
    'use strict';
    // Remove animation class
    this.$content.removeClass('content--error-pop');
    
    // trigger reflow
    // https://css-tricks.com/restart-css-animation/
    // this.$content[0].offsetWidth = this.$content[0].offsetWidth;
    
    
    this.$content
      .html('<p><strong' + header + '</strong> ' + text + '</p>')
      .addClass('content--error content--error-pop');
    this.toggleLoading();
  
    

  },
  
  render: function (response) {
    'use strict';
    var icon = new Image();
    icon.src = response.artworkUrl512;
    icon.onload = function () {
      Gimmie.$content
        .html(this)
        .append('<p><strong>' + response.trackName + '</strong></p>')
        .removeClass('content--error');
      Gimmie.toggleLoading();
      
      if(response.kind != 'mac-software') {
        var mask = new Image();
        mask.src = 'assets/img/icon-mask.png';
        mask.onload = function () {
          Gimmie.$content.prepend(this);
        }
      }
    };
  }
  
};

$(document).ready(function () {
  //Execute this on load
  'use strict';
  Gimmie.$form.on('submit', function (e) {
    e.preventDefault();
    Gimmie.toggleLoading();
    Gimmie.userInput = $(this).find('input').val();
    Gimmie.validate();
    if (Gimmie.userInputIsValid) {
      //makes request
                        
      $.ajax({
        url: "https://itunes.apple.com/lookup?id=" + Gimmie.appId,
        dataType: 'JSONP'
      })
        .done(function (response) {
        //when finished
          var response = response.results[0];
          console.log(response);
 
    // Check to see if request is valid & contains the info we want
    // If it does, render it. Otherwise throw an error
          if (response && response.artworkUrl512 !== null) {
            Gimmie.render(response);
          } else {
            Gimmie.throwError(
              'Invalid Response',
              'The request you made appears to not have an associated icon. <br> Try a different URL.'
            );
          }
        })
        .fail(function (data) {
        //when fails
          Gimmie.throwError(
            'iTunes API Error',
            'There was an error retrieving the info. Check the iTunes URL or try again later.'
          );
        });
      
    } else {
      Gimmie.throwError(
        'Invalid Link',
        'You must submit a standard iTunes store link with an ID, i.e. <br> <a href="https://itunes.apple.com/us/app/twitter/id333903271?mt=8">https://itunes.apple.com/us/app/twitter/<em>id333903271</em>?mt=8</a>'
      );
    }
  }
              

      );
});