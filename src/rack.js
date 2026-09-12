/* The rack on the product cards: eight modules the visitor can reorder.

   Reordering is what MixRack is, and its own preview film says so on screen
   -- "drag a slot to move it" -- so the mock that stands for the plug-in lets
   someone do it rather than watch it.

   Three ways in, because a drag is not available to everyone:
     - pointer: mouse or finger, using Pointer Events so both behave the same
       and a finger does not fall through to the page scrolling;
     - keyboard: focus a module and press the arrow keys;
     - either way the new position is announced, so the change is not only
       visible.

   Served from this origin as a classic script, like the rest of the site's:
   the CSP has no 'unsafe-inline'. */
(function () {
  'use strict';

  var racks = document.querySelectorAll('.rack');
  if (racks.length === 0) return;

  function slotsOf(rack) {
    return Array.prototype.slice.call(rack.querySelectorAll('.slot'));
  }

  function announce(rack, slot) {
    var status = rack.parentNode.querySelector('.rack-status');
    if (!status) return;
    var all = slotsOf(rack);
    var at = all.indexOf(slot) + 1;
    status.textContent = slot.textContent.trim() + ' moved to position ' + at + ' of ' + all.length + '.';
  }

  /* A module is dropped where it is let go: before the slot whose middle the
     pointer has passed, or at the end if it has passed them all. Moving the
     node is the whole of the state -- there is no list kept alongside the DOM
     to fall out of step with it. */
  function place(rack, moving, clientX, clientY) {
    var all = slotsOf(rack).filter(function (slot) { return slot !== moving; });
    var before = null;

    for (var i = 0; i < all.length; i += 1) {
      var box = all[i].getBoundingClientRect();
      var sameRow = clientY >= box.top && clientY <= box.bottom;
      if (sameRow && clientX < box.left + box.width / 2) { before = all[i]; break; }
      if (clientY < box.top) { before = all[i]; break; }
    }

    if (before) rack.insertBefore(moving, before);
    else rack.insertBefore(moving, rack.querySelector('.rack-node:last-child'));
  }

  function move(rack, slot, step) {
    var all = slotsOf(rack);
    var at = all.indexOf(slot);
    var to = at + step;
    if (to < 0 || to >= all.length) return false;
    if (step > 0) rack.insertBefore(slot, all[to].nextSibling);
    else rack.insertBefore(slot, all[to]);
    slot.focus();
    announce(rack, slot);
    return true;
  }

  Array.prototype.forEach.call(racks, function (rack) {
    var dragging = null;

    rack.addEventListener('pointerdown', function (event) {
      var slot = event.target.closest ? event.target.closest('.slot') : null;
      if (!slot || !rack.contains(slot) || event.button > 0) return;
      dragging = slot;
      slot.setPointerCapture(event.pointerId);
      slot.setAttribute('data-dragging', 'true');
      rack.setAttribute('data-dragging', 'true');
    });

    rack.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      /* Without this a finger drag scrolls the page instead of moving the
         module, and the rack appears not to respond at all. */
      event.preventDefault();
      place(rack, dragging, event.clientX, event.clientY);
    });

    function release(event) {
      if (!dragging) return;
      var slot = dragging;
      dragging = null;
      slot.removeAttribute('data-dragging');
      rack.removeAttribute('data-dragging');
      if (slot.hasPointerCapture && slot.hasPointerCapture(event.pointerId)) {
        slot.releasePointerCapture(event.pointerId);
      }
      announce(rack, slot);
    }

    rack.addEventListener('pointerup', release);
    rack.addEventListener('pointercancel', release);

    rack.addEventListener('keydown', function (event) {
      var slot = event.target.closest ? event.target.closest('.slot') : null;
      if (!slot || !rack.contains(slot)) return;
      var step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
        : (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0);
      if (!step) return;
      event.preventDefault();
      move(rack, slot, step);
    });

    /* No draggable attribute on the markup: the browser's own drag takes the
       gesture over on the first move and the pointer events stop arriving, so
       nothing moves. The grab cursor and the hint line carry the affordance
       instead. */
  });
}());
