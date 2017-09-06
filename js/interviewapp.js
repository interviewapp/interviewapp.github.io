(function() {
    /**
     * Tracks store visits via Google Analytics
     */
    var trackEvents = new function() {
      function trackClickEvent(selector) {
        var
          i = 0,
          elements = document.querySelectorAll(selector),
          l = elements.length;

        for (; i < l; i++)
          elements[i].onclick = sendTrackEvent;
      }

      function sendTrackEvent(event)
      {
        if (typeof window.ga !== 'function')
          return true;

        var
          el = this,
          url = el.getAttribute('href'),
          classesToEvents = [
              {
                className: 'app-store-link',
                eventName: 'App Store Link Clicked'
              },
              {
                className: 'gplay-link',
                eventName: 'Google Play Link Clicked'
              }
          ],
          i = 0,
          l = classesToEvents.length,
          classNames = el.className.split(' ');

        for (; i < l; i++)
        {
          if (classNames.indexOf(classesToEvents[i].className) !== -1)
          {
            window.ga('send', 'event', 'outbound', 'click', classesToEvents[i].eventName, {'hitCallback':
               function () {
                 document.location = url;
               }
             });
           }
        }

        return false;
      }

      this.run = function()
      {
        trackClickEvent('.trackable');
      }
    }

    /**
     * URL query parser
     */
    function splitUrlHashIntoPieces()
    {
        var
            aHashParts,
            sHashPart,
            nHashPartIndex,
            nHashPartDelimiterIndex,
            oUrlHash = {};

        aHashParts = location.hash.substr(1).split('/');
        nHashPartIndex = aHashParts.length;

        while (nHashPartIndex-- > 0)
        {
            sHashPart = aHashParts[nHashPartIndex];
            nHashPartDelimiterIndex = sHashPart.indexOf(':');

            if (nHashPartDelimiterIndex !== -1)
                oUrlHash[sHashPart.substr(0, nHashPartDelimiterIndex)] = sHashPart.substr(nHashPartDelimiterIndex + 1);
        }
        return oUrlHash;
    };

    function getParameterByName(name)
    {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1]);
    }

    /**
     * Request
     */
    function generateRequestID(sQuery)
    {
        return ['fresh.team', sQuery, Math.random() * 99999999 | 0].join('_');
    }

    function request(sController, oParams)
    {
        oParams.command.request_id = oParams.command.request_id || generateRequestID('command');

        $.ajax({
            dataType: 'json',
            global: false, // prevents global AJAX events
            cache: false,
            type: 'POST',
            url: sController,
            timeout: 10000,
            data: {
                request: JSON.stringify({
                    request_id: generateRequestID('request'),
                    resource: 'fresh.team_1.0',
                    commands: [oParams.command],
                    version: '1.0'
                })
            },
            error: oParams.error,
            success: function(oData)
            {
                try
                {
                    if (oData.commands[0].errors && oData.commands[0].errors.length)
                    {
                        oParams.error(oData.commands[0].errors);
                        return;
                    }

                    oParams.success(oData.commands[0]);
                }
                catch (e)
                {
                    oParams.error();
                }
            }
        });
    }

    /**
     * Deferred image loader
     */
    var loadImages = function() {
        var images = document.getElementsByTagName('img');

        for (var i = 0; i < images.length; i++)
        {
            if (!images[i].src)
                substituteImageSrc(images[i]);

            if (images[i].dataset.srcset && !images[i].srcset)
                images[i].setAttribute('srcset', images[i].dataset.srcset);
        }
    };

    if (window.devicePixelRatio >= 1.5)
    {
        var substituteImageSrc = function(image)
        {
            image.src = image.dataset.src.replace(/(\.\w+)$/, '@2x$1');
        }
    }
    else
    {
        var substituteImageSrc = function(image)
        {
            image.src = image.dataset.src;
        }
    }

    /**
     * Exports
     */
    window.splitUrlHashIntoPieces = splitUrlHashIntoPieces;
    window.getParameterByName = getParameterByName;
    window.request = request;
    window.loadImagesFromDataSets = loadImages;

    /**
     * Runner
     */
    trackEvents.run();
})();
