(function () {
  // Hide broken equipment logos on load error only
  document.querySelectorAll('.equipment-strip img').forEach(function (img) {
    img.addEventListener('error', function () { this.style.display = 'none'; });
  });

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!button || !nav) return;

    function closeNav() {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }

    button.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  function initCookieBanner() {
    var banner = document.getElementById("cookieBanner");
    var acceptBtn = document.getElementById("cookieAccept");
    if (!banner || !acceptBtn) return;

    var accepted = window.localStorage.getItem("wum2-cookie-accepted");
    if (accepted !== "1") {
      banner.hidden = false;
    }

    acceptBtn.addEventListener("click", function () {
      window.localStorage.setItem("wum2-cookie-accepted", "1");
      banner.hidden = true;
    });
  }

  function warmVideo(video) {
    if (!video) return;
    video.preload = "auto";
    if (video.readyState < 2) video.load();
  }

  function initPhotoGallery() {
    var root = document.querySelector("[data-photo-gallery]");
    var lightbox = document.getElementById("photoLightbox");
    if (!root || !lightbox) return;

    var tiles = Array.prototype.slice.call(root.querySelectorAll(".photo-tile"));
    var imageEl = lightbox.querySelector(".photo-lightbox__image");
    var closeBtn = lightbox.querySelector("[data-photo-close]");
    var prevBtn = lightbox.querySelector("[data-photo-prev]");
    var nextBtn = lightbox.querySelector("[data-photo-next]");
    var activeIndex = -1;
    var sources = tiles
      .map(function (tile, index) {
        return {
          index: index,
          src: tile.getAttribute("data-photo-src") || "",
          tile: tile,
        };
      })
      .filter(function (item) {
        return item.src !== "";
      });

    function revealTiles() {
      if (!("IntersectionObserver" in window)) {
        tiles.forEach(function (tile) {
          tile.classList.add("is-visible");
        });
        return;
      }

      var io = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var tile = entry.target;
            var delay = Number(tile.getAttribute("data-photo-index") || 0) % 6;
            tile.style.transitionDelay = delay * 45 + "ms";
            tile.classList.add("is-visible");
            observer.unobserve(tile);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );

      tiles.forEach(function (tile) {
        io.observe(tile);
      });
    }

    function openAt(sourceIndex) {
      if (!sources.length || !imageEl) return;
      activeIndex = ((sourceIndex % sources.length) + sources.length) % sources.length;
      var item = sources[activeIndex];
      imageEl.src = item.src;
      imageEl.alt = "";
      lightbox.hidden = false;
      document.documentElement.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.hidden = true;
      activeIndex = -1;
      if (imageEl) imageEl.removeAttribute("src");
      document.documentElement.style.overflow = "";
    }

    function step(delta) {
      if (activeIndex < 0) return;
      openAt(activeIndex + delta);
    }

    tiles.forEach(function (tile) {
      tile.addEventListener("click", function () {
        var src = tile.getAttribute("data-photo-src") || "";
        if (!src) return;
        var sourceIndex = sources.findIndex(function (item) {
          return item.tile === tile;
        });
        if (sourceIndex >= 0) openAt(sourceIndex);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    });

    revealTiles();
  }

  function initPreviewHover() {
    var cards = document.querySelectorAll(".portfolio-card");
    cards.forEach(function (card) {
      var preview = card.querySelector(".portfolio-card__preview");
      if (!preview) return;
      warmVideo(preview);

      var play = function () {
        var p = preview.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      };
      var stop = function () {
        preview.pause();
        preview.currentTime = 0;
      };

      card.addEventListener("mouseenter", play);
      card.addEventListener("mouseleave", stop);
      card.addEventListener("focusin", play);
      card.addEventListener("focusout", stop);
    });
  }

  var APERTURE_PATH = new Path2D(
    'M256.684,16.736A239.3,239.3,0,0,0,87.475,425.245,239.3,239.3,0,0,0,425.894,86.825,237.736,237.736,0,0,0,256.684,16.736Zm-9.9,32.242L146.033,224.237,92.048,130.226A207.136,207.136,0,0,1,246.787,48.978Zm56.437,127.035,45.912,79.413-46.2,80.791h-92.6l-45.859-79.859,46.189-80.345ZM72.648,160.7,173.436,336.217H65.526A207.1,207.1,0,0,1,72.648,160.7Zm9.791,207.515h202.2l-53.494,93.542A207.584,207.584,0,0,1,82.439,368.217Zm184.818,94.849L367.668,287.48l54.168,93.692A207.167,207.167,0,0,1,267.257,463.066ZM441.125,350.6,340.187,176.013H447.908A207.133,207.133,0,0,1,441.125,350.6ZM229.063,144.013l53.825-93.627a207.609,207.609,0,0,1,148.147,93.627Z'
  );

  function drawApertureGlyph(ctx, cx, cy, size, rotation, styleFn) {
    ctx.save();
    var scale = size / 512;
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.translate(-256, -256);
    styleFn(ctx, scale, cx, cy, rotation);
    ctx.restore();
  }

  function initApertureHero(canvas) {
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    var w = 0;
    var h = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var rafId = null;

    var pointer = {
      x: window.innerWidth * 0.8,
      y: window.innerHeight * 0.25,
      active: false,
      strength: 0,
    };

    var scrollY = window.scrollY || 0;
    var smoothScrollY = scrollY;
    var rotation = 0;

    // One shared stroke weight for outer ring + every blade edge.
    var LINE_W = 2.15;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      if (w <= 0 || h <= 0) return;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      requestDraw();
    }

    function requestDraw() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(draw);
    }

    function strokeUniform(localCtx, width, color, blur, blurColor, alpha) {
      localCtx.globalAlpha = alpha;
      localCtx.lineWidth = width;
      localCtx.strokeStyle = color;
      localCtx.shadowBlur = blur || 0;
      localCtx.shadowColor = blurColor || "transparent";
      localCtx.stroke(APERTURE_PATH);
    }

    function draw() {
      rafId = null;
      if (!w || !h) return;

      smoothScrollY += (scrollY - smoothScrollY) * (reducedMotion ? 0.2 : 0.08);
      ctx.clearRect(0, 0, w, h);

      var size = Math.max(w, h) * 1.5;
      var cx = w * 0.52;
      var isHome = document.body && document.body.classList.contains("home");
      var homeYOffset = isHome ? h * 0.2 : 0;
      var cy = h * 0.45 + homeYOffset - smoothScrollY * 0.22;

      var gx = finePointer ? pointer.x : w * 0.78;
      var gy = finePointer ? pointer.y : h * 0.18;

      var targetStrength = finePointer && pointer.active ? 1 : 0;
      pointer.strength += (targetStrength - pointer.strength) * 0.12;

      if (pointer.strength < 0.01) {
        if (Math.abs(scrollY - smoothScrollY) > 0.2) requestDraw();
        return;
      }

      var hoverBoost = 0.55 + pointer.strength * 0.45;

      drawApertureGlyph(ctx, cx, cy, size, rotation, function (localCtx, scale, centerX, centerY, glyphRotation) {
        var dx = gx - centerX;
        var dy = gy - centerY;
        var cosR = Math.cos(-glyphRotation);
        var sinR = Math.sin(-glyphRotation);
        var shapeX = (dx * cosR - dy * sinR) / scale + 256;
        var shapeY = (dx * sinR + dy * cosR) / scale + 256;
        // Smaller flashlight cone (was 215).
        var maskRadius = 72;

        localCtx.save();
        localCtx.lineJoin = "round";
        localCtx.lineCap = "round";

        // Soft depth (same geometry, slight offset) — still uniform weight.
        localCtx.save();
        localCtx.translate(1.4, 1.8);
        localCtx.globalCompositeOperation = "source-over";
        strokeUniform(
          localCtx,
          LINE_W,
          "rgba(28, 22, 12, 0.7)",
          0,
          "transparent",
          0.22 + 0.08 * hoverBoost
        );
        localCtx.restore();

        // Gold body — identical thickness on ring + blades.
        localCtx.globalCompositeOperation = "lighter";
        strokeUniform(
          localCtx,
          LINE_W,
          "rgba(194, 166, 106, " + (0.24 + 0.14 * hoverBoost).toFixed(3) + ")",
          2 + 1.2 * hoverBoost,
          "rgba(194, 166, 106, " + (0.05 + 0.04 * hoverBoost).toFixed(3) + ")",
          0.32 + 0.14 * hoverBoost
        );

        // Specular edge (thinner highlight sitting ON the same path, not thicker outer ring).
        strokeUniform(
          localCtx,
          Math.max(0.7, LINE_W * 0.38),
          "rgba(255, 246, 220, " + (0.14 + 0.14 * hoverBoost).toFixed(3) + ")",
          0.8 + 0.8 * hoverBoost,
          "rgba(255, 246, 220, 0.08)",
          0.32 + 0.12 * hoverBoost
        );

        // Flashlight — softer / less bright
        localCtx.globalAlpha = 1;
        localCtx.shadowBlur = 0;
        localCtx.globalCompositeOperation = "destination-in";
        var mask = localCtx.createRadialGradient(shapeX, shapeY, 0, shapeX, shapeY, maskRadius);
        mask.addColorStop(0, "rgba(255,255,255,0.55)");
        mask.addColorStop(0.1, "rgba(255,255,255," + (0.3 + 0.06 * hoverBoost).toFixed(3) + ")");
        mask.addColorStop(0.3, "rgba(255,255,255," + (0.06 + 0.04 * hoverBoost).toFixed(3) + ")");
        mask.addColorStop(1, "rgba(255,255,255,0)");
        localCtx.fillStyle = mask;
        localCtx.fillRect(0, 0, 512, 512);

        // Keep only the wire (no fills).
        localCtx.lineWidth = LINE_W + 3;
        localCtx.strokeStyle = "#fff";
        localCtx.stroke(APERTURE_PATH);
        localCtx.restore();
      });

      var animatingScroll = Math.abs(scrollY - smoothScrollY) > 0.2;
      var animatingHover = pointer.strength > 0.01;
      if (animatingHover && !reducedMotion) {
        rotation += 0.0005;
      }
      if (animatingScroll || animatingHover) requestDraw();
    }

    function onPointerMove(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      requestDraw();
    }

    function onPointerLeave() {
      pointer.active = false;
      requestDraw();
    }

    function onScroll() {
      scrollY = window.scrollY || 0;
      requestDraw();
    }

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (finePointer) {
      window.addEventListener("mousemove", onPointerMove, { passive: true });
      window.addEventListener("mouseleave", onPointerLeave);
    }
  }

  function initServiceShowcase() {
    var tabsRoot = document.querySelector('.service-tabs');
    var buttons = document.querySelectorAll('.service-tab');
    var video   = document.querySelector('.service-video');
    var placeholder = document.querySelector('.service-media__placeholder');
    var activePanel = document.querySelector('.service-active-desc');
    var activeText = document.querySelector('.service-active-desc__text');
    var detailCard = document.querySelector('.service-detail-card');
    var detailText = document.querySelector('.service-detail-card__text');
    var mediaRoot = document.querySelector('.service-media');
    var controls = document.querySelector('.service-player-controls');
    var playBtn = document.querySelector('.service-player__play');
    var muteBtn = document.querySelector('.service-player__mute');
    var volume = document.querySelector('.service-player__volume');
    var fullscreenBtn = document.querySelector('.service-player__fullscreen');
    var indicator = null;
    var indicatorTimer = null;
    if (!buttons.length) return;

    if (tabsRoot) {
      indicator = tabsRoot.querySelector('.service-tabs__indicator');
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'service-tabs__indicator';
        indicator.setAttribute('aria-hidden', 'true');
        tabsRoot.appendChild(indicator);
      }
    }

    function moveIndicator(btn, instant) {
      if (!indicator || !tabsRoot || !btn) return;
      var rootRect = tabsRoot.getBoundingClientRect();
      var btnRect = btn.getBoundingClientRect();
      var x = btnRect.left - rootRect.left;
      // Overlap the row hairlines by 1px so the gold frame never looks thicker at the bottom.
      var y = (btnRect.top - rootRect.top) - 1;
      var h = btnRect.height + 2;

      if (instant) {
        indicator.style.transition = 'none';
      }

      indicator.style.width = btnRect.width + 'px';
      indicator.style.height = h + 'px';
      indicator.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';

      if (instant) {
        void indicator.offsetWidth;
        indicator.style.transition = '';
      } else {
        indicator.classList.add('is-moving');
        if (indicatorTimer) clearTimeout(indicatorTimer);
        indicatorTimer = setTimeout(function () {
          indicator.classList.remove('is-moving');
        }, 560);
      }

      requestAnimationFrame(function () {
        indicator.classList.add('is-ready');
      });
    }

    function isFullscreen() {
      var active = document.fullscreenElement || document.webkitFullscreenElement;
      return !!(active && (active === mediaRoot || active === video));
    }

    function syncPlayerUi() {
      if (!video) return;
      if (controls) {
        var hidden = (video.style.display === 'none');
        controls.classList.toggle('is-hidden', hidden);
      }
      if (playBtn) {
        playBtn.textContent = video.paused ? 'PLAY' : 'PAUSE';
      }
      if (muteBtn) {
        muteBtn.textContent = (video.muted || video.volume === 0) ? 'UNMUTE' : 'MUTE';
      }
      if (volume) {
        volume.value = String(Math.round((video.muted ? 0 : video.volume) * 100));
      }
      if (fullscreenBtn) {
        fullscreenBtn.textContent = isFullscreen() ? 'EXIT FULL' : 'FULL SCREEN';
      }
    }

    function toggleVideoPlayback() {
      if (!video || video.style.display === 'none') return;
      if (video.paused) video.play().catch(function () {});
      else video.pause();
    }

    function toggleFullscreen() {
      if (!video || video.style.display === 'none') return;
      var target = mediaRoot || video;

      if (isFullscreen()) {
        if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        return;
      }

      if (target.requestFullscreen) {
        target.requestFullscreen().catch(function () {});
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    }

    function activateItem(btn, instant) {
      // deactivate all
      buttons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });

      // activate clicked
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      btn.classList.remove('is-pop');
      // restart short pop animation on each click
      void btn.offsetWidth;
      btn.classList.add('is-pop');
      moveIndicator(btn, !!instant);

      if (activePanel && activeText) {
        activePanel.classList.add('is-fading');
        activePanel.classList.remove('is-reveal');
        setTimeout(function () {
          activeText.textContent = btn.getAttribute('data-desc') || '';
          activePanel.classList.remove('is-fading');
          activePanel.classList.remove('is-reveal');
          void activePanel.offsetWidth;
          activePanel.classList.add('is-reveal');
        }, 160);
      }

      if (detailCard && detailText) {
        detailCard.classList.add('is-fading');
        detailCard.classList.remove('is-reveal');
        setTimeout(function () {
          detailText.textContent = btn.getAttribute('data-below') || '';
          detailCard.classList.remove('is-fading');
          detailCard.classList.remove('is-reveal');
          void detailCard.offsetWidth;
          detailCard.classList.add('is-reveal');
        }, 180);
      }

      // switch video
      if (!video) return;
      var src = btn.getAttribute('data-video');
      if (src && src !== '') {
        if (placeholder) placeholder.style.display = 'none';
        video.style.display = '';
        if (controls) controls.classList.remove('is-hidden');
        video.classList.add('is-fading');
        setTimeout(function () {
          video.src = src;
          video.load();
          video.play().catch(function () {});
          video.classList.remove('is-fading');
          syncPlayerUi();
        }, 250);
      } else {
        // no video for this item
        video.classList.add('is-fading');
        setTimeout(function () {
          video.pause();
          video.removeAttribute('src');
          video.load();
          video.classList.remove('is-fading');
          if (placeholder) placeholder.style.display = '';
          if (controls) controls.classList.add('is-hidden');
          syncPlayerUi();
        }, 250);
      }
    }

    if (video) {
      video.addEventListener('play', syncPlayerUi);
      video.addEventListener('pause', syncPlayerUi);
      video.addEventListener('volumechange', syncPlayerUi);
      video.addEventListener('click', toggleVideoPlayback);
    }

    if (playBtn && video) {
      playBtn.addEventListener('click', toggleVideoPlayback);
    }

    if (muteBtn && video) {
      muteBtn.addEventListener('click', function () {
        video.muted = !video.muted;
        syncPlayerUi();
      });
    }

    if (volume && video) {
      volume.addEventListener('input', function () {
        var v = Number(volume.value) / 100;
        video.volume = Math.max(0, Math.min(1, v));
        video.muted = (video.volume === 0);
        syncPlayerUi();
      });
    }

    if (fullscreenBtn && video) {
      fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    document.addEventListener('fullscreenchange', syncPlayerUi);
    document.addEventListener('webkitfullscreenchange', syncPlayerUi);

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () { activateItem(btn, false); });
    });

    // activate first on load
    if (buttons[0]) activateItem(buttons[0], true);
    syncPlayerUi();

    window.addEventListener('resize', function () {
      var active = tabsRoot ? tabsRoot.querySelector('.service-tab.is-active') : null;
      if (active) moveIndicator(active, true);
    });
  }

  function initServiceDetailReveal() {
    var card = document.querySelector('.service-detail-card');
    if (!card) return;

    if (!('IntersectionObserver' in window)) {
      card.classList.add('is-visible');
      return;
    }

    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

    io.observe(card);
  }

  function initLineReveal(section) {
    var items = Array.prototype.slice.call(section.querySelectorAll('.line-item'));
    if (!items.length) return;

    var GOLD     = '#c2a66a';
    var WHITE    = 'rgba(241,240,234,0.92)';
    var DIM_H3   = 'rgba(241,240,234,0.35)';
    var DURATION = '0.6s';

    // Initial: dim text + slight push-down. opacity stays ≥ 0.55 so border remains visible
    items.forEach(function (item) {
      item.style.transition = 'opacity ' + DURATION + ' ease, transform ' + DURATION + ' ease';
      item.style.opacity = '0.55';
      item.style.transform = 'translateY(8px)';
      var h3 = item.querySelector('h3');
      if (h3) {
        h3.style.transition = 'color ' + DURATION + ' ease';
        h3.style.color = DIM_H3;
      }
    });

    function onScroll() {
      var trigger = window.innerHeight * 0.62;
      var activeIndex = -1;
      items.forEach(function (item, i) {
        if (item.getBoundingClientRect().top < trigger) activeIndex = i;
      });

      items.forEach(function (item, i) {
        var h3 = item.querySelector('h3');
        if (i < activeIndex) {
          item.style.opacity   = '1';
          item.style.transform = 'translateY(0)';
          if (h3) h3.style.color = WHITE;
        } else if (i === activeIndex) {
          item.style.opacity   = '1';
          item.style.transform = 'translateY(0)';
          if (h3) h3.style.color = GOLD;
        } else {
          item.style.opacity   = '0.55';
          item.style.transform = 'translateY(8px)';
          if (h3) h3.style.color = DIM_H3;
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initHeroTilt(content) {
    if (!content) return;

    var hero = content.closest('.hero');
    if (!hero) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reducedMotion || !finePointer) return;

    var maxRotateX = 2.5;
    var maxRotateY = 5;
    var rafId = null;
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;

    function applyTransform() {
      content.style.transform =
        'rotateX(' + currentX.toFixed(2) + 'deg) rotateY(' + currentY.toFixed(2) + 'deg)';
    }

    function tick() {
      rafId = null;
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      applyTransform();

      if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function requestTick() {
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }

    function onMove(e) {
      var rect = content.getBoundingClientRect();
      var x = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      var y = (e.clientY - (rect.top + rect.height / 2)) / rect.height;

      targetY = x * maxRotateY * 2;
      targetX = -y * maxRotateX * 2;
      requestTick();
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
      requestTick();
    }

    hero.addEventListener('mousemove', onMove, { passive: true });
    hero.addEventListener('mouseleave', onLeave);
  }

  function scheduleEnterSteps(root, steps, doneAt, onDone) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      root.classList.add("is-entered");
      if (onDone) onDone();
      return;
    }

    root.classList.add("is-entering");

    steps.forEach(function (step) {
      window.setTimeout(function () {
        root.querySelectorAll('[data-enter="' + step.key + '"]').forEach(function (el) {
          el.classList.add("is-in");
        });
      }, step.delay);
    });

    window.setTimeout(function () {
      root.classList.add("is-entered");
      if (onDone) onDone();
    }, doneAt);
  }

  function initLedeEnter() {
    document.querySelectorAll("[data-lede-enter]").forEach(function (lede) {
      if (lede.closest(".has-notice")) {
        lede.classList.add("is-entered");
        lede.querySelectorAll(".lede-enter-item").forEach(function (el) {
          el.classList.add("is-in");
        });
        return;
      }

      scheduleEnterSteps(
        lede,
        [
          { key: "corners", delay: 80 },
          { key: "rule", delay: 1000 },
          { key: "label", delay: 1350 },
          { key: "body", delay: 1700 },
        ],
        2100
      );
    });
  }

  function initLazyVideos() {
    var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-lazy-video]"));
    if (!videos.length) return;

    function activate(video) {
      if (video.dataset.lazyReady === "1") return;
      var src = video.getAttribute("data-src") || "";
      if (!src) return;
      video.dataset.lazyReady = "1";
      var source = document.createElement("source");
      source.src = src;
      video.appendChild(source);
      video.load();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (!("IntersectionObserver" in window)) {
      videos.forEach(activate);
      return;
    }

    var io = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          activate(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "180px 0px", threshold: 0.12 }
    );

    videos.forEach(function (video) {
      io.observe(video);
    });
  }

  function initContactEnter() {
    var section = document.querySelector("[data-contact-enter]");
    if (!section) return;

    if (section.classList.contains("has-notice") || section.classList.contains("is-entered")) {
      section.classList.add("is-entered");
      section.querySelectorAll(".contact-enter-item, .lede-enter-item").forEach(function (el) {
        el.classList.add("is-in");
      });
      var notice = section.querySelector(".form-notice");
      if (notice) {
        window.setTimeout(function () {
          notice.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      }
      return;
    }

    // Form first (conversion), then map/points — keep delays short for mobile.
    scheduleEnterSteps(
      section,
      [
        { key: "form", delay: 120 },
        { key: "rest", delay: 520 },
      ],
      1400
    );
  }

  function initContactForm() {
    var form = document.getElementById("wum2ContactForm");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
      }
    });
  }

  function initMapFlashlight() {
    var frame = document.querySelector("[data-map-flashlight]");
    if (!frame) return;

    var map = frame.querySelector(".contact-world-map");
    if (!map) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    var flashSize = "138px";

    function setFlash(clientX, clientY) {
      var rect = frame.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var x = ((clientX - rect.left) / rect.width) * 100;
      var y = ((clientY - rect.top) / rect.height) * 100;
      map.style.setProperty("--mx", x + "%");
      map.style.setProperty("--my", y + "%");
      map.style.setProperty("--flash", flashSize);
    }

    function clearFlash() {
      map.style.setProperty("--flash", "0px");
    }

    frame.addEventListener("pointermove", function (event) {
      setFlash(event.clientX, event.clientY);
    });

    frame.addEventListener("pointerenter", function (event) {
      setFlash(event.clientX, event.clientY);
    });

    frame.addEventListener("pointerleave", clearFlash);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initCookieBanner();
    initPhotoGallery();
    initPreviewHover();
    initServiceShowcase();
    initServiceDetailReveal();
    initContactForm();
    initLazyVideos();
    initLedeEnter();
    initContactEnter();
    initMapFlashlight();
    document.querySelectorAll('.section--reveal').forEach(function (sec) {
      initLineReveal(sec);
    });
    initApertureHero(document.getElementById("wumMeshCanvas"));
    initHeroTilt(document.querySelector('.hero__content'));
  });
})();

