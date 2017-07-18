/*global define, console, alert */
/*jslint nomen: true */
define(function () {
  'use strict';
  var opts = {
      size: 25,
      side: 3,
      dotRadius: 1,
      rotSpeed: .3,
      minDeformation: 10,
      maxDeformation: 12,
      focal: 350,
      distZ: 500,
      transSpeed: 1,
      transEasing: function(t) { return (t < .5) ? 8 * t * t * t * t : 1 - 8 * (t = 1 - t) * t * t * t; }
  };

  function projection(p, focal) {
    // Keep the original Z
    return [focal * p[0] / p[2], focal * p[1] / p[2], p[2]];
  }
  function rotateX(p, a) {
      var d = Math.sqrt(p[2] * p[2] + p[1] * p[1]),
          na = Math.atan2(p[1], p[2]) + a;
      return [p[0], d * Math.sin(na), d * Math.cos(na)];
  }
  function rotateY(p, a) {
      var d = Math.sqrt(p[2] * p[2] + p[0] * p[0]),
          na = Math.atan2(p[2], p[0]) + a;
      return [d * Math.cos(na), p[1], d * Math.sin(na)];
  }

  var crawlerCanvas, ctx

  function resize() {
      crawlerCanvas = document.getElementById('crawlerCanvas')
      if(crawlerCanvas && crawlerCanvas.getContext) {
        ctx = crawlerCanvas.getContext('2d');
        crawlerCanvas.width = crawlerCanvas.offsetWidth;
        crawlerCanvas.height = crawlerCanvas.offsetHeight;
        windowWidthParam = $(window).width();
        windowHeightParam = $(window).height();
        ctx.translate(crawlerCanvas.width * .5, crawlerCanvas.height * .5);
        ctx.strokeStyle = 'black';
      }
  }
  window.addEventListener('resize', resize);

  var angleYOffset = 0;
  var angleYOffsetGoal = .5;
  var angleXOffset = 0;
  var angleXOffsetGoal = .5;
  var windowWidthParam = $(window).width();
  var windowHeightParam = $(window).height();
  window.addEventListener('mousemove', function(e) { angleYOffsetGoal = Math.PI * 2 * (e.clientX / windowWidthParam - .5); angleXOffsetGoal = Math.PI * (.5 - e.clientY / windowHeightParam); });
  window.addEventListener('mouseout', function(e) { angleYOffsetGoal = angleXOffsetGoal = .5; });

  function random(a, b) { return a + Math.random() * (b - a); }

  var basePoints = [];
  // Populate points array
  (function() {
      var l = opts.side - 1,
          s = opts.size;
      for(var i = 0; i <= l; i++)	{
          for(var j = 0; j <= l; j++)	{
              for(var k = 0; k <= l; k++)	{
                  var x = s * (i / l - .5),
                      y = s * (j / l - .5),
                      z = s * (k / l - .5);
                  basePoints.push([x, y, z]);
              }
          }
      }
  })();
  var lines = [];
  // Populate lines array
  (function() {
      var l = opts.side,
          l2 = l * l;
      for(var i = 0; i < l; i++) {
          for(var j = 0; j < l; j++) {
              for(var k = 0; k < l; k++) {
                  var id = i * l2 + j * l + k;
                  if(i > 0)
                      lines.push([id, id - l2]);
                  if(j > 0)
                      lines.push([id, id - l]);
                  if(k > 0)
                      lines.push([id, id - 1]);
              }
          }
      }
  })();

  function deformation(p) {
      var t = [];
      for(var i = 0, l = p.length; i < l; i++) {
          var r = random(opts.minDeformation, opts.maxDeformation),
              a = random(0, 2 * Math.PI),
              b = random(0, 2 * Math.PI);
          var tmp = r * Math.sin(a);
          t.push([p[i][0] + r *  Math.cos(a), p[i][1] + tmp * Math.cos(b), p[i][2] + tmp * -Math.sin(b)]);
      }
      return t;
  }
  var transformedPoints = deformation(basePoints);

  function lerp(p1, p2, t) {
      return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1]), p1[2] + t * (p2[2] - p1[2])];
  }

  var previousTdir;
  function loop() {
    if(crawlerCanvas){
      requestAnimationFrame(loop);
      angleXOffset += (angleXOffsetGoal - angleXOffset) * .1;
      angleYOffset += (angleYOffsetGoal - angleYOffset) * .1;
      ctx.clearRect(-crawlerCanvas.width * .5, -crawlerCanvas.height * .5, crawlerCanvas.width, crawlerCanvas.height);
      var t = Date.now() * 1e-3;
      var transform = opts.transEasing((Math.sin(t * opts.transSpeed) + 1) * .5);
      // Detect when we change of "transform direction"
      var tdir = (Math.cos(t * opts.transSpeed) > 0) ? 1 : -1;
      if(previousTdir !== tdir) {
          previousTdir = tdir;
          // Generate new points
          if(tdir == 1)
              transformedPoints = deformation(basePoints);
      }
      var rot = t * opts.rotSpeed + angleYOffset;
      var points = [];
      var i, l;

      for(i = 0, l = basePoints.length; i < l; i++) {
          var p = lerp(basePoints[i], transformedPoints[i], transform);
          p = rotateX(rotateY(p, rot), angleXOffset);
          p[2] += opts.distZ;
          p = projection(p, opts.focal);
          points.push(p);
          ctx.beginPath();
          ctx.arc(p[0], p[1], opts.focal * opts.dotRadius / p[2], 0, Math.PI * 2);
          ctx.fill();
      }

      ctx.beginPath();
      for(i = 0, l = lines.length; i < l; i++) {
          ctx.moveTo(points[lines[i][0]][0], points[lines[i][0]][1]);
          ctx.lineTo(points[lines[i][1]][0], points[lines[i][1]][1]);
      }
      ctx.stroke();
    }
  }
  
  function returnFunc () {
    requestAnimationFrame(loop)
  }
  
  return { canvas: returnFunc, resize: resize };
  
});
