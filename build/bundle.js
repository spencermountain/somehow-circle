
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    //a very-tiny version of d3-scale's scaleLinear
    const scaleLinear = function (obj) {
      let world = obj.world || [];
      let minmax = obj.minmax || obj.minMax || [];
      const calc = (num) => {
        let range = minmax[1] - minmax[0];
        let percent = (num - minmax[0]) / range;
        let size = world[1] - world[0];
        return size * percent
      };

      return calc
    };

    // let scale = scaleLinear({
    //   world: [0, 300],
    //   minmax: [0, 100]
    // })
    // console.log(scale(50))

    const pi = Math.PI,
        tau = 2 * pi,
        epsilon = 1e-6,
        tauEpsilon = tau - epsilon;

    function Path() {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
    }

    function path() {
      return new Path;
    }

    Path.prototype = path.prototype = {
      constructor: Path,
      moveTo: function(x, y) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
      },
      closePath: function() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      },
      lineTo: function(x, y) {
        this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      quadraticCurveTo: function(x1, y1, x, y) {
        this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) {
        this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      arcTo: function(x1, y1, x2, y2, r) {
        x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
        var x0 = this._x1,
            y0 = this._y1,
            x21 = x2 - x1,
            y21 = y2 - y1,
            x01 = x0 - x1,
            y01 = y0 - y1,
            l01_2 = x01 * x01 + y01 * y01;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x1,y1).
        if (this._x1 === null) {
          this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon));

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
          var x20 = x2 - x0,
              y20 = y2 - y0,
              l21_2 = x21 * x21 + y21 * y21,
              l20_2 = x20 * x20 + y20 * y20,
              l21 = Math.sqrt(l21_2),
              l01 = Math.sqrt(l01_2),
              l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
              t01 = l / l01,
              t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon) {
            this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
          }

          this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
        }
      },
      arc: function(x, y, r, a0, a1, ccw) {
        x = +x, y = +y, r = +r, ccw = !!ccw;
        var dx = r * Math.cos(a0),
            dy = r * Math.sin(a0),
            x0 = x + dx,
            y0 = y + dy,
            cw = 1 ^ ccw,
            da = ccw ? a0 - a1 : a1 - a0;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x0,y0).
        if (this._x1 === null) {
          this._ += "M" + x0 + "," + y0;
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
          this._ += "L" + x0 + "," + y0;
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = da % tau + tau;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon) {
          this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon) {
          this._ += "A" + r + "," + r + ",0," + (+(da >= pi)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
        }
      },
      rect: function(x, y, w, h) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
      },
      toString: function() {
        return this._;
      }
    };

    function constant(x) {
      return function constant() {
        return x;
      };
    }

    var abs = Math.abs;
    var atan2 = Math.atan2;
    var cos = Math.cos;
    var max = Math.max;
    var min = Math.min;
    var sin = Math.sin;
    var sqrt = Math.sqrt;

    var epsilon$1 = 1e-12;
    var pi$1 = Math.PI;
    var halfPi = pi$1 / 2;
    var tau$1 = 2 * pi$1;

    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi$1 : Math.acos(x);
    }

    function asin(x) {
      return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
    }

    function arcInnerRadius(d) {
      return d.innerRadius;
    }

    function arcOuterRadius(d) {
      return d.outerRadius;
    }

    function arcStartAngle(d) {
      return d.startAngle;
    }

    function arcEndAngle(d) {
      return d.endAngle;
    }

    function arcPadAngle(d) {
      return d && d.padAngle; // Note: optional!
    }

    function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
      var x10 = x1 - x0, y10 = y1 - y0,
          x32 = x3 - x2, y32 = y3 - y2,
          t = y32 * x10 - x32 * y10;
      if (t * t < epsilon$1) return;
      t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
      return [x0 + t * x10, y0 + t * y10];
    }

    // Compute perpendicular offset line of length rc.
    // http://mathworld.wolfram.com/Circle-LineIntersection.html
    function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
      var x01 = x0 - x1,
          y01 = y0 - y1,
          lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01),
          ox = lo * y01,
          oy = -lo * x01,
          x11 = x0 + ox,
          y11 = y0 + oy,
          x10 = x1 + ox,
          y10 = y1 + oy,
          x00 = (x11 + x10) / 2,
          y00 = (y11 + y10) / 2,
          dx = x10 - x11,
          dy = y10 - y11,
          d2 = dx * dx + dy * dy,
          r = r1 - rc,
          D = x11 * y10 - x10 * y11,
          d = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D * D)),
          cx0 = (D * dy - dx * d) / d2,
          cy0 = (-D * dx - dy * d) / d2,
          cx1 = (D * dy + dx * d) / d2,
          cy1 = (-D * dx + dy * d) / d2,
          dx0 = cx0 - x00,
          dy0 = cy0 - y00,
          dx1 = cx1 - x00,
          dy1 = cy1 - y00;

      // Pick the closer of the two intersection points.
      // TODO Is there a faster way to determine which intersection to use?
      if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

      return {
        cx: cx0,
        cy: cy0,
        x01: -ox,
        y01: -oy,
        x11: cx0 * (r1 / r - 1),
        y11: cy0 * (r1 / r - 1)
      };
    }

    function arc() {
      var innerRadius = arcInnerRadius,
          outerRadius = arcOuterRadius,
          cornerRadius = constant(0),
          padRadius = null,
          startAngle = arcStartAngle,
          endAngle = arcEndAngle,
          padAngle = arcPadAngle,
          context = null;

      function arc() {
        var buffer,
            r,
            r0 = +innerRadius.apply(this, arguments),
            r1 = +outerRadius.apply(this, arguments),
            a0 = startAngle.apply(this, arguments) - halfPi,
            a1 = endAngle.apply(this, arguments) - halfPi,
            da = abs(a1 - a0),
            cw = a1 > a0;

        if (!context) context = buffer = path();

        // Ensure that the outer radius is always larger than the inner radius.
        if (r1 < r0) r = r1, r1 = r0, r0 = r;

        // Is it a point?
        if (!(r1 > epsilon$1)) context.moveTo(0, 0);

        // Or is it a circle or annulus?
        else if (da > tau$1 - epsilon$1) {
          context.moveTo(r1 * cos(a0), r1 * sin(a0));
          context.arc(0, 0, r1, a0, a1, !cw);
          if (r0 > epsilon$1) {
            context.moveTo(r0 * cos(a1), r0 * sin(a1));
            context.arc(0, 0, r0, a1, a0, cw);
          }
        }

        // Or is it a circular or annular sector?
        else {
          var a01 = a0,
              a11 = a1,
              a00 = a0,
              a10 = a1,
              da0 = da,
              da1 = da,
              ap = padAngle.apply(this, arguments) / 2,
              rp = (ap > epsilon$1) && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)),
              rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
              rc0 = rc,
              rc1 = rc,
              t0,
              t1;

          // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
          if (rp > epsilon$1) {
            var p0 = asin(rp / r0 * sin(ap)),
                p1 = asin(rp / r1 * sin(ap));
            if ((da0 -= p0 * 2) > epsilon$1) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
            else da0 = 0, a00 = a10 = (a0 + a1) / 2;
            if ((da1 -= p1 * 2) > epsilon$1) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
            else da1 = 0, a01 = a11 = (a0 + a1) / 2;
          }

          var x01 = r1 * cos(a01),
              y01 = r1 * sin(a01),
              x10 = r0 * cos(a10),
              y10 = r0 * sin(a10);

          // Apply rounded corners?
          if (rc > epsilon$1) {
            var x11 = r1 * cos(a11),
                y11 = r1 * sin(a11),
                x00 = r0 * cos(a00),
                y00 = r0 * sin(a00),
                oc;

            // Restrict the corner radius according to the sector angle.
            if (da < pi$1 && (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10))) {
              var ax = x01 - oc[0],
                  ay = y01 - oc[1],
                  bx = x11 - oc[0],
                  by = y11 - oc[1],
                  kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2),
                  lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
              rc0 = min(rc, (r0 - lc) / (kc - 1));
              rc1 = min(rc, (r1 - lc) / (kc + 1));
            }
          }

          // Is the sector collapsed to a line?
          if (!(da1 > epsilon$1)) context.moveTo(x01, y01);

          // Does the sector’s outer ring have rounded corners?
          else if (rc1 > epsilon$1) {
            t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
            t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

            context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

            // Have the corners merged?
            if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

            // Otherwise, draw the two corners and the ring.
            else {
              context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
              context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
              context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
            }
          }

          // Or is the outer ring just a circular arc?
          else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

          // Is there no inner ring, and it’s a circular sector?
          // Or perhaps it’s an annular sector collapsed due to padding?
          if (!(r0 > epsilon$1) || !(da0 > epsilon$1)) context.lineTo(x10, y10);

          // Does the sector’s inner ring (or point) have rounded corners?
          else if (rc0 > epsilon$1) {
            t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
            t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

            context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

            // Have the corners merged?
            if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

            // Otherwise, draw the two corners and the ring.
            else {
              context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
              context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
              context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
            }
          }

          // Or is the inner ring just a circular arc?
          else context.arc(0, 0, r0, a10, a00, cw);
        }

        context.closePath();

        if (buffer) return context = null, buffer + "" || null;
      }

      arc.centroid = function() {
        var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
            a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi$1 / 2;
        return [cos(a) * r, sin(a) * r];
      };

      arc.innerRadius = function(_) {
        return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant(+_), arc) : innerRadius;
      };

      arc.outerRadius = function(_) {
        return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant(+_), arc) : outerRadius;
      };

      arc.cornerRadius = function(_) {
        return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant(+_), arc) : cornerRadius;
      };

      arc.padRadius = function(_) {
        return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant(+_), arc) : padRadius;
      };

      arc.startAngle = function(_) {
        return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), arc) : startAngle;
      };

      arc.endAngle = function(_) {
        return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), arc) : endAngle;
      };

      arc.padAngle = function(_) {
        return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), arc) : padAngle;
      };

      arc.context = function(_) {
        return arguments.length ? ((context = _ == null ? null : _), arc) : context;
      };

      return arc;
    }

    function array(x) {
      return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
    }

    function Linear(context) {
      this._context = context;
    }

    Linear.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // proceed
          default: this._context.lineTo(x, y); break;
        }
      }
    };

    function curveLinear(context) {
      return new Linear(context);
    }

    function x(p) {
      return p[0];
    }

    function y(p) {
      return p[1];
    }

    function line(x$1, y$1) {
      var defined = constant(true),
          context = null,
          curve = curveLinear,
          output = null;

      x$1 = typeof x$1 === "function" ? x$1 : (x$1 === undefined) ? x : constant(x$1);
      y$1 = typeof y$1 === "function" ? y$1 : (y$1 === undefined) ? y : constant(y$1);

      function line(data) {
        var i,
            n = (data = array(data)).length,
            d,
            defined0 = false,
            buffer;

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) output.lineStart();
            else output.lineEnd();
          }
          if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      line.x = function(_) {
        return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant(+_), line) : x$1;
      };

      line.y = function(_) {
        return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant(+_), line) : y$1;
      };

      line.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), line) : defined;
      };

      line.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
      };

      line.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
      };

      return line;
    }

    var curveRadialLinear = curveRadial(curveLinear);

    function Radial(curve) {
      this._curve = curve;
    }

    Radial.prototype = {
      areaStart: function() {
        this._curve.areaStart();
      },
      areaEnd: function() {
        this._curve.areaEnd();
      },
      lineStart: function() {
        this._curve.lineStart();
      },
      lineEnd: function() {
        this._curve.lineEnd();
      },
      point: function(a, r) {
        this._curve.point(r * Math.sin(a), r * -Math.cos(a));
      }
    };

    function curveRadial(curve) {

      function radial(context) {
        return new Radial(curve(context));
      }

      radial._curve = curve;

      return radial;
    }

    function lineRadial(l) {
      var c = l.curve;

      l.angle = l.x, delete l.x;
      l.radius = l.y, delete l.y;

      l.curve = function(_) {
        return arguments.length ? c(curveRadial(_)) : c()._curve;
      };

      return l;
    }

    function lineRadial$1() {
      return lineRadial(line().curve(curveRadialLinear));
    }

    const drawArcs = function (arcs, xScale, rScale, q, rotate) {
      return arcs.map((obj) => {
        let r = rScale(obj.radius);
        let attrs = {
          startAngle: xScale(obj.to) - q + rotate,
          endAngle: xScale(obj.from) - q + rotate,
          innerRadius: r,
          outerRadius: r + rScale(obj.width)
        };
        let path = arc()(attrs);
        return {
          type: 'arc',
          path: path,
          color: obj.color
        }
      })
    };

    const drawArcs$1 = function (arcs, xScale, rScale, q, rotate) {
      return arcs.map((obj) => {
        let r = rScale(obj.radius);
        let attrs = {
          startAngle: xScale(obj.to) - q + rotate,
          endAngle: xScale(obj.from) - q + rotate,
          innerRadius: r,
          outerRadius: r + rScale(obj.width)
        };
        let path = arc()(attrs);
        let clockwise = attrs.endAngle < attrs.startAngle;
        let arrow = {};
        return {
          type: 'arrow',
          clockwise: clockwise,
          path: path,
          color: obj.color,
          arrow: arrow
        }
      })
    };

    const drawLines = function (lines, xScale, rScale, q, rotate) {
      // draw lines
      return lines.map((obj) => {
        let data = [
          { angle: obj.angle, radius: obj.radius },
          { angle: obj.angle, radius: obj.length + obj.radius }
        ];
        let path = lineRadial$1()
          .angle((d) => xScale(d.angle) - q + rotate)
          .radius((d) => rScale(d.radius));
        return {
          type: 'line',
          path: path(data),
          color: obj.color,
          width: obj.width
        }
      })
    };

    const findPoint = function (angle, r) {
      return {
        x: r * Math.sin(angle),
        y: -r * Math.cos(angle)
      }
    };

    const drawLabels = function (labels, xScale, rScale, q, rotate) {
      return labels.map((obj) => {
        let point = findPoint(xScale(obj.angle) - q + rotate, rScale(obj.radius));
        let angle = obj.angle;
        // don't go upside-down
        if (angle > 90) {
          angle -= 180;
          obj.align = obj.align === 'left' ? 'right' : 'left';
        } else if (angle < -90) {
          angle += 180;
          obj.align = obj.align === 'left' ? 'right' : 'left';
        }
        // console.log(obj.rotate)
        if (angle > 0) {
          angle -= obj.rotate;
        } else {
          angle += obj.rotate;
        }
        return {
          type: 'label',
          x: point.x,
          y: point.y,
          angle: angle,
          align: obj.align === 'left' ? 'start' : 'end',
          size: obj.size,
          text: obj.text,
          color: obj.color
        }
      })
    };

    const findPoint$1 = function (angle, r) {
      return {
        x: r * Math.sin(angle),
        y: -r * Math.cos(angle)
      }
    };

    const drawLabels$1 = function (labels, xScale, rScale, q, rotate) {
      return labels.map((obj) => {
        let point = findPoint$1(xScale(obj.angle) - q + rotate, rScale(obj.radius));
        let angle = obj.angle;
        // don't go upside-down
        if (angle > 90) {
          angle -= 180;
          obj.align = obj.align === 'left' ? 'right' : 'left';
        } else if (angle < -90) {
          angle += 180;
          obj.align = obj.align === 'left' ? 'right' : 'left';
        }
        // console.log(obj.rotate)
        if (angle > 0) {
          angle -= obj.rotate;
        } else {
          angle += obj.rotate;
        }
        return {
          type: 'tick',
          x: point.x,
          y: point.y,
          angle: angle,
          align: obj.align === 'left' ? 'start' : 'end',
          size: obj.size,
          text: obj.text,
          color: obj.color
        }
      })
    };

    //export let name = ''

    let q = Math.PI / 2;
    const trig = [-Math.PI, Math.PI];

    function toRadian(deg) {
      var pi = Math.PI;
      return deg * (pi / 180)
    }

    const maxRadius = function (shapes) {
      let max = 0;
      shapes.forEach((o) => {
        let r = o.radius + o.width;
        if (r > max) {
          max = r;
        }
      });
      return max
    };

    const layout = function (arcs, lines, labels, ticks, arrows, world) {
      let xScale = scaleLinear({ minmax: [world.from, world.to], world: trig });
      let rotate = toRadian(world.rotate);
      // console.log(world.rotate)

      let arr = arcs.concat(lines, labels, arrows);
      let maxR = maxRadius(arr);
      maxR = maxR + world.margin;
      let rScale = scaleLinear({ minmax: [0, maxR], world: [0, 50] });

      // draw arcs
      let shapes = drawArcs(arcs, xScale, rScale, q, rotate);
      // draw lines
      shapes = shapes.concat(drawLines(lines, xScale, rScale, q, rotate));
      // draw kabeks
      shapes = shapes.concat(drawLabels(labels, xScale, rScale, q, rotate));
      // draw ticks
      shapes = shapes.concat(drawLabels$1(ticks, xScale, rScale, q, rotate));
      // draw arrows
      shapes = shapes.concat(drawArcs$1(arrows, xScale, rScale, q, rotate));
      return shapes
    };

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const arcs = writable([]);
    const lines = writable([]);
    const labels = writable([]);
    const ticks = writable([]);
    const arrows = writable([]);
    //
    // export const _rotate = 0

    /* src/Round.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file = "src/Round.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-1lnhtnf-style";
    	style.textContent = "path.svelte-1lnhtnf{pointer-events:all}path.svelte-1lnhtnf:hover{filter:drop-shadow(0px 1px 1px steelblue)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm91bmQuc3ZlbHRlIiwic291cmNlcyI6WyJSb3VuZC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gJ3N2ZWx0ZSdcbiAgaW1wb3J0IGxheW91dCBmcm9tICcuL2xheW91dCdcbiAgaW1wb3J0IHsgYXJjcywgbGluZXMsIGxhYmVscywgdGlja3MsIGFycm93cyB9IGZyb20gJy4vc3RvcmVzLmpzJ1xuXG4gIGV4cG9ydCBsZXQgcmFkaXVzID0gNTAwXG4gIGV4cG9ydCBsZXQgcm90YXRlID0gMFxuICBleHBvcnQgbGV0IGZyb20gPSAwXG4gIGV4cG9ydCBsZXQgdG8gPSAzNjBcbiAgZXhwb3J0IGxldCBtYXJnaW4gPSAwXG4gIHJhZGl1cyA9IE51bWJlcihyYWRpdXMpXG5cbiAgbGV0IHdvcmxkID0ge1xuICAgIHJhZGl1czogcmFkaXVzLFxuICAgIHJvdGF0ZTogTnVtYmVyKHJvdGF0ZSksXG4gICAgZnJvbTogTnVtYmVyKGZyb20pLFxuICAgIHRvOiBOdW1iZXIodG8pLFxuICAgIG1hcmdpbjogTnVtYmVyKG1hcmdpbilcbiAgfVxuICBsZXQgc2hhcGVzID0gW11cbiAgb25Nb3VudCgoKSA9PiB7XG4gICAgc2hhcGVzID0gbGF5b3V0KCRhcmNzLCAkbGluZXMsICRsYWJlbHMsICR0aWNrcywgJGFycm93cywgd29ybGQpXG4gICAgY29uc29sZS5sb2coc2hhcGVzKVxuICB9KVxuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbiAgcGF0aCB7XG4gICAgcG9pbnRlci1ldmVudHM6IGFsbDtcbiAgfVxuICBwYXRoOmhvdmVyIHtcbiAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KDBweCAxcHggMXB4IHN0ZWVsYmx1ZSk7XG4gIH1cbjwvc3R5bGU+XG5cbjxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cbiAgPHN2ZyB2aWV3Qm94PVwiLTUwLC01MCwxMDAsMTAwXCIgc2hhcGUtcmVuZGVyaW5nPVwiZ2VvbWV0cmljUHJlY2lzaW9uXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPlxuXG4gICAgPCEtLSBhcnJvdy1oZWFkIC0tPlxuICAgIDxkZWZzPlxuICAgICAgPG1hcmtlclxuICAgICAgICBpZD1cInRyaWFuZ2xlXCJcbiAgICAgICAgdmlld0JveD1cIjAgMCAxMCAxMFwiXG4gICAgICAgIHJlZlg9XCI0XCJcbiAgICAgICAgcmVmWT1cIjZcIlxuICAgICAgICBtYXJrZXJVbml0cz1cInN0cm9rZVdpZHRoXCJcbiAgICAgICAgbWFya2VyV2lkdGg9XCI5XCJcbiAgICAgICAgbWFya2VySGVpZ2h0PVwiOVwiXG4gICAgICAgIG9yaWVudD1cImF1dG9cIj5cbiAgICAgICAgPHBhdGggZD1cIk0gMCAwIEwgMTAgNCBMIDAgMTAgelwiIGZpbGw9XCIjRDY4ODgxXCIgdHJhbnNmb3JtPVwicm90YXRlKDIzKVwiIC8+XG4gICAgICA8L21hcmtlcj5cbiAgICA8L2RlZnM+XG5cbiAgICB7I2VhY2ggc2hhcGVzIGFzIG99XG4gICAgICB7I2lmIG8udHlwZSA9PT0gJ2FyYyd9XG4gICAgICAgIDxwYXRoIGNsYXNzPVwibGlua1wiIGQ9e28ucGF0aH0gc3Ryb2tlPVwibm9uZVwiIGZpbGw9e28uY29sb3J9IHN0eWxlPVwiXCIgc3Ryb2tlLXdpZHRoPXsxfSAvPlxuICAgICAgey9pZn1cbiAgICAgIHsjaWYgby50eXBlID09PSAnbGluZSd9XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgY2xhc3M9XCJsaW5rXCJcbiAgICAgICAgICBkPXtvLnBhdGh9XG4gICAgICAgICAgc3Ryb2tlPXtvLmNvbG9yfVxuICAgICAgICAgIGZpbGw9e28uY29sb3J9XG4gICAgICAgICAgc3R5bGU9XCJcIlxuICAgICAgICAgIHN0cm9rZS13aWR0aD17by53aWR0aH0gLz5cbiAgICAgIHsvaWZ9XG4gICAgICB7I2lmIG8udHlwZSA9PT0gJ2xhYmVsJ31cbiAgICAgICAgPHRleHRcbiAgICAgICAgICB4PXtvLnh9XG4gICAgICAgICAgeT17by55fVxuICAgICAgICAgIHRyYW5zZm9ybT1cInJvdGF0ZSh7by5hbmdsZX0se28ueH0se28ueX0pXCJcbiAgICAgICAgICBmb250LXNpemU9e28uc2l6ZX1cbiAgICAgICAgICB0ZXh0LWFuY2hvcj17by5hbGlnbn1cbiAgICAgICAgICBmaWxsPXtvLmNvbG9yfT5cbiAgICAgICAgICB7QGh0bWwgby50ZXh0fVxuICAgICAgICA8L3RleHQ+XG4gICAgICB7L2lmfVxuICAgICAgeyNpZiBvLnR5cGUgPT09ICd0aWNrJ31cbiAgICAgICAgPHRleHRcbiAgICAgICAgICB4PXtvLnh9XG4gICAgICAgICAgeT17by55fVxuICAgICAgICAgIHRyYW5zZm9ybT1cInJvdGF0ZSh7by5hbmdsZX0se28ueH0se28ueX0pXCJcbiAgICAgICAgICBmb250LXNpemU9e28uc2l6ZX1cbiAgICAgICAgICB0ZXh0LWFuY2hvcj17by5hbGlnbn1cbiAgICAgICAgICBmaWxsPXtvLmNvbG9yfT5cbiAgICAgICAgICB7QGh0bWwgby50ZXh0fVxuICAgICAgICA8L3RleHQ+XG4gICAgICB7L2lmfVxuICAgICAgeyNpZiBvLnR5cGUgPT09ICdhcnJvdyd9XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgY2xhc3M9XCJsaW5rXCJcbiAgICAgICAgICBkPXtvLnBhdGh9XG4gICAgICAgICAgc3Ryb2tlPVwibm9uZVwiXG4gICAgICAgICAgZmlsbD17by5jb2xvcn1cbiAgICAgICAgICBzdHlsZT1cIlwiXG4gICAgICAgICAgc3Ryb2tlLXdpZHRoPXsxfVxuICAgICAgICAgIG1hcmtlci1lbmQ9XCJ1cmwoI3RyaWFuZ2xlKVwiIC8+XG4gICAgICB7L2lmfVxuICAgIHsvZWFjaH1cbiAgPC9zdmc+XG5cbjwvZGl2PlxuPHNsb3QgLz5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEyQkUsSUFBSSxlQUFDLENBQUMsQUFDSixjQUFjLENBQUUsR0FBRyxBQUNyQixDQUFDLEFBQ0QsbUJBQUksTUFBTSxBQUFDLENBQUMsQUFDVixNQUFNLENBQUUsWUFBWSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQUFDNUMsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (55:6) {#if o.type === 'arc'}
    function create_if_block_4(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let path_stroke_width_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "link svelte-1lnhtnf");
    			attr_dev(path, "d", path_d_value = /*o*/ ctx[14].path);
    			attr_dev(path, "stroke", "none");
    			attr_dev(path, "fill", path_fill_value = /*o*/ ctx[14].color);
    			attr_dev(path, "stroke-width", path_stroke_width_value = 1);
    			add_location(path, file, 55, 8, 1228);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*shapes*/ 1 && path_d_value !== (path_d_value = /*o*/ ctx[14].path)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*shapes*/ 1 && path_fill_value !== (path_fill_value = /*o*/ ctx[14].color)) {
    				attr_dev(path, "fill", path_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(55:6) {#if o.type === 'arc'}",
    		ctx
    	});

    	return block;
    }

    // (58:6) {#if o.type === 'line'}
    function create_if_block_3(ctx) {
    	let path;
    	let path_d_value;
    	let path_stroke_value;
    	let path_fill_value;
    	let path_stroke_width_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "link svelte-1lnhtnf");
    			attr_dev(path, "d", path_d_value = /*o*/ ctx[14].path);
    			attr_dev(path, "stroke", path_stroke_value = /*o*/ ctx[14].color);
    			attr_dev(path, "fill", path_fill_value = /*o*/ ctx[14].color);
    			attr_dev(path, "stroke-width", path_stroke_width_value = /*o*/ ctx[14].width);
    			add_location(path, file, 58, 8, 1366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*shapes*/ 1 && path_d_value !== (path_d_value = /*o*/ ctx[14].path)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*shapes*/ 1 && path_stroke_value !== (path_stroke_value = /*o*/ ctx[14].color)) {
    				attr_dev(path, "stroke", path_stroke_value);
    			}

    			if (dirty & /*shapes*/ 1 && path_fill_value !== (path_fill_value = /*o*/ ctx[14].color)) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (dirty & /*shapes*/ 1 && path_stroke_width_value !== (path_stroke_width_value = /*o*/ ctx[14].width)) {
    				attr_dev(path, "stroke-width", path_stroke_width_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(58:6) {#if o.type === 'line'}",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#if o.type === 'label'}
    function create_if_block_2(ctx) {
    	let text_1;
    	let raw_value = /*o*/ ctx[14].text + "";
    	let text_1_x_value;
    	let text_1_y_value;
    	let text_1_transform_value;
    	let text_1_font_size_value;
    	let text_1_text_anchor_value;
    	let text_1_fill_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			attr_dev(text_1, "x", text_1_x_value = /*o*/ ctx[14].x);
    			attr_dev(text_1, "y", text_1_y_value = /*o*/ ctx[14].y);
    			attr_dev(text_1, "transform", text_1_transform_value = "rotate(" + /*o*/ ctx[14].angle + "," + /*o*/ ctx[14].x + "," + /*o*/ ctx[14].y + ")");
    			attr_dev(text_1, "font-size", text_1_font_size_value = /*o*/ ctx[14].size);
    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*o*/ ctx[14].align);
    			attr_dev(text_1, "fill", text_1_fill_value = /*o*/ ctx[14].color);
    			add_location(text_1, file, 67, 8, 1574);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			text_1.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*shapes*/ 1 && raw_value !== (raw_value = /*o*/ ctx[14].text + "")) text_1.innerHTML = raw_value;
    			if (dirty & /*shapes*/ 1 && text_1_x_value !== (text_1_x_value = /*o*/ ctx[14].x)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_y_value !== (text_1_y_value = /*o*/ ctx[14].y)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_transform_value !== (text_1_transform_value = "rotate(" + /*o*/ ctx[14].angle + "," + /*o*/ ctx[14].x + "," + /*o*/ ctx[14].y + ")")) {
    				attr_dev(text_1, "transform", text_1_transform_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_font_size_value !== (text_1_font_size_value = /*o*/ ctx[14].size)) {
    				attr_dev(text_1, "font-size", text_1_font_size_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_text_anchor_value !== (text_1_text_anchor_value = /*o*/ ctx[14].align)) {
    				attr_dev(text_1, "text-anchor", text_1_text_anchor_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_fill_value !== (text_1_fill_value = /*o*/ ctx[14].color)) {
    				attr_dev(text_1, "fill", text_1_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(67:6) {#if o.type === 'label'}",
    		ctx
    	});

    	return block;
    }

    // (78:6) {#if o.type === 'tick'}
    function create_if_block_1(ctx) {
    	let text_1;
    	let raw_value = /*o*/ ctx[14].text + "";
    	let text_1_x_value;
    	let text_1_y_value;
    	let text_1_transform_value;
    	let text_1_font_size_value;
    	let text_1_text_anchor_value;
    	let text_1_fill_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			attr_dev(text_1, "x", text_1_x_value = /*o*/ ctx[14].x);
    			attr_dev(text_1, "y", text_1_y_value = /*o*/ ctx[14].y);
    			attr_dev(text_1, "transform", text_1_transform_value = "rotate(" + /*o*/ ctx[14].angle + "," + /*o*/ ctx[14].x + "," + /*o*/ ctx[14].y + ")");
    			attr_dev(text_1, "font-size", text_1_font_size_value = /*o*/ ctx[14].size);
    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*o*/ ctx[14].align);
    			attr_dev(text_1, "fill", text_1_fill_value = /*o*/ ctx[14].color);
    			add_location(text_1, file, 78, 8, 1846);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			text_1.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*shapes*/ 1 && raw_value !== (raw_value = /*o*/ ctx[14].text + "")) text_1.innerHTML = raw_value;
    			if (dirty & /*shapes*/ 1 && text_1_x_value !== (text_1_x_value = /*o*/ ctx[14].x)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_y_value !== (text_1_y_value = /*o*/ ctx[14].y)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_transform_value !== (text_1_transform_value = "rotate(" + /*o*/ ctx[14].angle + "," + /*o*/ ctx[14].x + "," + /*o*/ ctx[14].y + ")")) {
    				attr_dev(text_1, "transform", text_1_transform_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_font_size_value !== (text_1_font_size_value = /*o*/ ctx[14].size)) {
    				attr_dev(text_1, "font-size", text_1_font_size_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_text_anchor_value !== (text_1_text_anchor_value = /*o*/ ctx[14].align)) {
    				attr_dev(text_1, "text-anchor", text_1_text_anchor_value);
    			}

    			if (dirty & /*shapes*/ 1 && text_1_fill_value !== (text_1_fill_value = /*o*/ ctx[14].color)) {
    				attr_dev(text_1, "fill", text_1_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(78:6) {#if o.type === 'tick'}",
    		ctx
    	});

    	return block;
    }

    // (89:6) {#if o.type === 'arrow'}
    function create_if_block(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let path_stroke_width_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "link svelte-1lnhtnf");
    			attr_dev(path, "d", path_d_value = /*o*/ ctx[14].path);
    			attr_dev(path, "stroke", "none");
    			attr_dev(path, "fill", path_fill_value = /*o*/ ctx[14].color);
    			attr_dev(path, "stroke-width", path_stroke_width_value = 1);
    			attr_dev(path, "marker-end", "url(#triangle)");
    			add_location(path, file, 89, 8, 2119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*shapes*/ 1 && path_d_value !== (path_d_value = /*o*/ ctx[14].path)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*shapes*/ 1 && path_fill_value !== (path_fill_value = /*o*/ ctx[14].color)) {
    				attr_dev(path, "fill", path_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(89:6) {#if o.type === 'arrow'}",
    		ctx
    	});

    	return block;
    }

    // (54:4) {#each shapes as o}
    function create_each_block(ctx) {
    	let if_block0_anchor;
    	let if_block1_anchor;
    	let if_block2_anchor;
    	let if_block3_anchor;
    	let if_block4_anchor;
    	let if_block0 = /*o*/ ctx[14].type === "arc" && create_if_block_4(ctx);
    	let if_block1 = /*o*/ ctx[14].type === "line" && create_if_block_3(ctx);
    	let if_block2 = /*o*/ ctx[14].type === "label" && create_if_block_2(ctx);
    	let if_block3 = /*o*/ ctx[14].type === "tick" && create_if_block_1(ctx);
    	let if_block4 = /*o*/ ctx[14].type === "arrow" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			if (if_block4) if_block4.c();
    			if_block4_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, if_block0_anchor, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, if_block4_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*o*/ ctx[14].type === "arc") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*o*/ ctx[14].type === "line") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*o*/ ctx[14].type === "label") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*o*/ ctx[14].type === "tick") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1(ctx);
    					if_block3.c();
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*o*/ ctx[14].type === "arrow") {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block(ctx);
    					if_block4.c();
    					if_block4.m(if_block4_anchor.parentNode, if_block4_anchor);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(if_block0_anchor);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(if_block4_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(54:4) {#each shapes as o}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let svg;
    	let defs;
    	let marker;
    	let path;
    	let t;
    	let current;
    	let each_value = /*shapes*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			marker = svg_element("marker");
    			path = svg_element("path");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(path, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path, "fill", "#D68881");
    			attr_dev(path, "transform", "rotate(23)");
    			attr_dev(path, "class", "svelte-1lnhtnf");
    			add_location(path, file, 49, 8, 1065);
    			attr_dev(marker, "id", "triangle");
    			attr_dev(marker, "viewBox", "0 0 10 10");
    			attr_dev(marker, "refX", "4");
    			attr_dev(marker, "refY", "6");
    			attr_dev(marker, "markerUnits", "strokeWidth");
    			attr_dev(marker, "markerWidth", "9");
    			attr_dev(marker, "markerHeight", "9");
    			attr_dev(marker, "orient", "auto");
    			add_location(marker, file, 40, 6, 859);
    			add_location(defs, file, 39, 4, 846);
    			attr_dev(svg, "viewBox", "-50,-50,100,100");
    			attr_dev(svg, "shape-rendering", "geometricPrecision");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			add_location(svg, file, 36, 2, 721);
    			attr_dev(div, "class", "container");
    			add_location(div, file, 35, 0, 695);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, defs);
    			append_dev(defs, marker);
    			append_dev(marker, path);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*shapes*/ 1) {
    				each_value = /*shapes*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $arcs;
    	let $lines;
    	let $labels;
    	let $ticks;
    	let $arrows;
    	validate_store(arcs, "arcs");
    	component_subscribe($$self, arcs, $$value => $$invalidate(8, $arcs = $$value));
    	validate_store(lines, "lines");
    	component_subscribe($$self, lines, $$value => $$invalidate(9, $lines = $$value));
    	validate_store(labels, "labels");
    	component_subscribe($$self, labels, $$value => $$invalidate(10, $labels = $$value));
    	validate_store(ticks, "ticks");
    	component_subscribe($$self, ticks, $$value => $$invalidate(11, $ticks = $$value));
    	validate_store(arrows, "arrows");
    	component_subscribe($$self, arrows, $$value => $$invalidate(12, $arrows = $$value));
    	let { radius = 500 } = $$props;
    	let { rotate = 0 } = $$props;
    	let { from = 0 } = $$props;
    	let { to = 360 } = $$props;
    	let { margin = 0 } = $$props;
    	radius = Number(radius);

    	let world = {
    		radius,
    		rotate: Number(rotate),
    		from: Number(from),
    		to: Number(to),
    		margin: Number(margin)
    	};

    	let shapes = [];

    	onMount(() => {
    		$$invalidate(0, shapes = layout($arcs, $lines, $labels, $ticks, $arrows, world));
    		console.log(shapes);
    	});

    	const writable_props = ["radius", "rotate", "from", "to", "margin"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Round> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Round", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("radius" in $$props) $$invalidate(1, radius = $$props.radius);
    		if ("rotate" in $$props) $$invalidate(2, rotate = $$props.rotate);
    		if ("from" in $$props) $$invalidate(3, from = $$props.from);
    		if ("to" in $$props) $$invalidate(4, to = $$props.to);
    		if ("margin" in $$props) $$invalidate(5, margin = $$props.margin);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		layout,
    		arcs,
    		lines,
    		labels,
    		ticks,
    		arrows,
    		radius,
    		rotate,
    		from,
    		to,
    		margin,
    		world,
    		shapes,
    		$arcs,
    		$lines,
    		$labels,
    		$ticks,
    		$arrows
    	});

    	$$self.$inject_state = $$props => {
    		if ("radius" in $$props) $$invalidate(1, radius = $$props.radius);
    		if ("rotate" in $$props) $$invalidate(2, rotate = $$props.rotate);
    		if ("from" in $$props) $$invalidate(3, from = $$props.from);
    		if ("to" in $$props) $$invalidate(4, to = $$props.to);
    		if ("margin" in $$props) $$invalidate(5, margin = $$props.margin);
    		if ("world" in $$props) world = $$props.world;
    		if ("shapes" in $$props) $$invalidate(0, shapes = $$props.shapes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [shapes, radius, rotate, from, to, margin, $$scope, $$slots];
    }

    class Round extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1lnhtnf-style")) add_css();

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			radius: 1,
    			rotate: 2,
    			from: 3,
    			to: 4,
    			margin: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Round",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get radius() {
    		throw new Error("<Round>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Round>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Round>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Round>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get from() {
    		throw new Error("<Round>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set from(value) {
    		throw new Error("<Round>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get to() {
    		throw new Error("<Round>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Round>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Round>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Round>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var colors = {
      blue: '#6699cc',
      green: '#6accb2',
      yellow: '#e1e6b3',
      red: '#cc7066',
      pink: '#F2C0BB', //'#e6b8b3',

      brown: '#705E5C',
      orange: '#cc8a66',
      purple: '#d8b3e6',
      navy: '#335799',
      olive: '#7f9c6c',

      fuscia: '#735873', //'#603960',
      beige: '#e6d7b3',
      slate: '#8C8C88',
      suede: '#9c896c',
      burnt: '#603a39',

      sea: '#50617A',
      sky: '#2D85A8',
      night: '#303b50',
      // dark: '#2C3133',
      rouge: '#914045',
      grey: '#838B91',

      mud: '#C4ABAB',
      royal: '#275291',
      cherry: '#cc6966',
      tulip: '#e6b3bc',
      rose: '#D68881',
      fire: '#AB5850',

      greyblue: '#72697D',
      greygreen: '#8BA3A2',
      greypurple: '#978BA3',
      burn: '#6D5685',

      slategrey: '#bfb0b3',
      light: '#a3a5a5',
      lighter: '#d7d5d2',
      fudge: '#4d4d4d',
      lightgrey: '#949a9e',

      white: '#fbfbfb',
      dimgrey: '#606c74',
      softblack: '#463D4F',
      dark: '#443d3d',
      black: '#333333',
    };

    /* src/Arc.svelte generated by Svelte v3.24.1 */
    const file$1 = "src/Arc.svelte";

    function create_fragment$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$1, 28, 0, 534);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { to = 90 } = $$props;
    	let { from = 0 } = $$props;
    	let { radius = 80 } = $$props;
    	let { width = 20 } = $$props;
    	to = Number(to);
    	from = Number(from);
    	radius = Number(radius);
    	width = Number(width);
    	let { color = "blue" } = $$props;
    	color = colors[color] || color;

    	arcs.update(arr => {
    		arr.push({ color, to, from, radius, width });
    		return arr;
    	});

    	const writable_props = ["to", "from", "radius", "width", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Arc> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Arc", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    		if ("from" in $$props) $$invalidate(1, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		arcs,
    		colors,
    		to,
    		from,
    		radius,
    		width,
    		color
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    		if ("from" in $$props) $$invalidate(1, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [to, from, radius, width, color];
    }

    class Arc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			to: 0,
    			from: 1,
    			radius: 2,
    			width: 3,
    			color: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arc",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get to() {
    		throw new Error("<Arc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Arc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get from() {
    		throw new Error("<Arc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set from(value) {
    		throw new Error("<Arc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Arc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Arc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Arc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Arc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Arc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Arc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Circle.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/Circle.svelte";

    function create_fragment$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$2, 28, 0, 534);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { to = 0 } = $$props;
    	let { from = 360 } = $$props;
    	let { radius = 80 } = $$props;
    	let { width = 1 } = $$props;
    	to = Number(to);
    	from = Number(from);
    	radius = Number(radius);
    	width = Number(width);
    	let { color = "blue" } = $$props;
    	color = colors[color] || color;

    	arcs.update(arr => {
    		arr.push({ color, to, from, radius, width });
    		return arr;
    	});

    	const writable_props = ["to", "from", "radius", "width", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Circle> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Circle", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    		if ("from" in $$props) $$invalidate(1, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		arcs,
    		colors,
    		to,
    		from,
    		radius,
    		width,
    		color
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    		if ("from" in $$props) $$invalidate(1, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [to, from, radius, width, color];
    }

    class Circle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			to: 0,
    			from: 1,
    			radius: 2,
    			width: 3,
    			color: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Circle",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get from() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set from(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Line.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/Line.svelte";

    function create_fragment$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$3, 25, 0, 497);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { angle = 0 } = $$props;
    	let { at = 0 } = $$props;
    	angle = angle || at;
    	let { length = 40 } = $$props;
    	let { radius = 0 } = $$props;
    	let { width = 0.1 } = $$props;
    	let { color = "grey" } = $$props;
    	color = colors[color] || color;

    	lines.update(arr => {
    		arr.push({
    			color,
    			angle: Number(angle),
    			radius: Number(radius),
    			length: Number(length),
    			width: Number(width)
    		});

    		return arr;
    	});

    	const writable_props = ["angle", "at", "length", "radius", "width", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Line> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Line", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("angle" in $$props) $$invalidate(0, angle = $$props.angle);
    		if ("at" in $$props) $$invalidate(2, at = $$props.at);
    		if ("length" in $$props) $$invalidate(3, length = $$props.length);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		lines,
    		colors,
    		angle,
    		at,
    		length,
    		radius,
    		width,
    		color
    	});

    	$$self.$inject_state = $$props => {
    		if ("angle" in $$props) $$invalidate(0, angle = $$props.angle);
    		if ("at" in $$props) $$invalidate(2, at = $$props.at);
    		if ("length" in $$props) $$invalidate(3, length = $$props.length);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [angle, color, at, length, radius, width];
    }

    class Line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			angle: 0,
    			at: 2,
    			length: 3,
    			radius: 4,
    			width: 5,
    			color: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get angle() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set angle(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get at() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set at(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get length() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set length(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Label.svelte generated by Svelte v3.24.1 */
    const file$4 = "src/Label.svelte";

    function create_fragment$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$4, 29, 0, 584);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { angle = 0 } = $$props;
    	let { at = 0 } = $$props;
    	angle = angle || at;
    	let { radius = 0 } = $$props;
    	let { rotate = 0 } = $$props;
    	let { size = 1.5 } = $$props;
    	let { align = "left" } = $$props;
    	let { text = "" } = $$props;
    	let { color = "grey" } = $$props;
    	color = colors[color] || color;

    	labels.update(arr => {
    		arr.push({
    			text,
    			color,
    			align,
    			angle: Number(angle),
    			radius: Number(radius),
    			size: Number(size),
    			rotate: Number(rotate)
    		});

    		return arr;
    	});

    	const writable_props = ["angle", "at", "radius", "rotate", "size", "align", "text", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Label> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Label", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("angle" in $$props) $$invalidate(0, angle = $$props.angle);
    		if ("at" in $$props) $$invalidate(2, at = $$props.at);
    		if ("radius" in $$props) $$invalidate(3, radius = $$props.radius);
    		if ("rotate" in $$props) $$invalidate(4, rotate = $$props.rotate);
    		if ("size" in $$props) $$invalidate(5, size = $$props.size);
    		if ("align" in $$props) $$invalidate(6, align = $$props.align);
    		if ("text" in $$props) $$invalidate(7, text = $$props.text);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		labels,
    		colors,
    		angle,
    		at,
    		radius,
    		rotate,
    		size,
    		align,
    		text,
    		color
    	});

    	$$self.$inject_state = $$props => {
    		if ("angle" in $$props) $$invalidate(0, angle = $$props.angle);
    		if ("at" in $$props) $$invalidate(2, at = $$props.at);
    		if ("radius" in $$props) $$invalidate(3, radius = $$props.radius);
    		if ("rotate" in $$props) $$invalidate(4, rotate = $$props.rotate);
    		if ("size" in $$props) $$invalidate(5, size = $$props.size);
    		if ("align" in $$props) $$invalidate(6, align = $$props.align);
    		if ("text" in $$props) $$invalidate(7, text = $$props.text);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [angle, color, at, radius, rotate, size, align, text];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			angle: 0,
    			at: 2,
    			radius: 3,
    			rotate: 4,
    			size: 5,
    			align: 6,
    			text: 7,
    			color: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get angle() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set angle(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get at() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set at(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Arrow.svelte generated by Svelte v3.24.1 */
    const file$5 = "src/Arrow.svelte";

    function create_fragment$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$5, 28, 0, 538);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { to = 90 } = $$props;
    	let { from = 0 } = $$props;
    	let { radius = 80 } = $$props;
    	let { width = 20 } = $$props;
    	to = Number(to);
    	from = Number(from);
    	radius = Number(radius);
    	width = Number(width);
    	let { color = "blue" } = $$props;
    	color = colors[color] || color;

    	arrows.update(arr => {
    		arr.push({ color, to, from, radius, width });
    		return arr;
    	});

    	const writable_props = ["to", "from", "radius", "width", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Arrow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Arrow", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    		if ("from" in $$props) $$invalidate(1, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		arrows,
    		colors,
    		to,
    		from,
    		radius,
    		width,
    		color
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    		if ("from" in $$props) $$invalidate(1, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [to, from, radius, width, color];
    }

    class Arrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			to: 0,
    			from: 1,
    			radius: 2,
    			width: 3,
    			color: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arrow",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get to() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get from() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set from(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Demo.svelte generated by Svelte v3.24.1 */
    const file$6 = "Demo.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-1retagn-style";
    	style.textContent = ".container.svelte-1retagn{width:50%;border:1px solid grey}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVtby5zdmVsdGUiLCJzb3VyY2VzIjpbIkRlbW8uc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGltcG9ydCB7IFJvdW5kLCBBcmMsIExpbmUsIExhYmVsLCBDaXJjbGUsIEFycm93IH0gZnJvbSAnLi9zcmMnXG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICAuY29udGFpbmVyIHtcbiAgICB3aWR0aDogNTAlO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGdyZXk7XG4gIH1cbjwvc3R5bGU+XG5cbjxkaXYgY2xhc3M9XCJjb2xcIj5cbiAgPGRpdiBjbGFzcz1cImgzXCI+XG4gICAgPGFcbiAgICAgIHN0eWxlPVwiY29sb3I6c3RlZWxibHVlOyBmb250LXNpemU6MjBweDtcIlxuICAgICAgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9zcGVuY2VybW91bnRhaW4vc29tZWhvdy1jaXJjbGVcIj5cbiAgICAgIHNvbWVob3ctY2lyY2xlXG4gICAgPC9hPlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgIDxSb3VuZCByb3RhdGU9XCIwXCIgbWFyZ2luPVwiNDBcIj5cbiAgICAgIDxBcnJvdyBmcm9tPVwiMTVcIiB0bz1cIjE1NVwiIGNvbG9yPVwicm9zZVwiIHdpZHRoPVwiNVwiIC8+XG4gICAgICA8QXJyb3cgZnJvbT1cIjE5NVwiIHRvPVwiMzQ1XCIgY29sb3I9XCJyb3NlXCIgd2lkdGg9XCI1XCIgLz5cbiAgICAgIDwhLS0gPExhYmVsIGFuZ2xlPVwiMTgwXCIgcmFkaXVzPVwiOTBcIiB0ZXh0PVwiVUlcIiBjb2xvcj1cImdyZXlcIiBzaXplPVwiNFwiIC8+IC0tPlxuICAgICAgPCEtLSA8TGFiZWwgYW5nbGU9XCIwXCIgcmFkaXVzPVwiMTEwXCIgdGV4dD1cIkFyY2FuZSBDTElcIiBjb2xvcj1cImdyZXlcIiBzaXplPVwiNFwiIC8+IC0tPlxuICAgIDwvUm91bmQ+XG4gIDwvZGl2PlxuPC9kaXY+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0UsVUFBVSxlQUFDLENBQUMsQUFDVixLQUFLLENBQUUsR0FBRyxDQUNWLE1BQU0sQ0FBRSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQUFDeEIsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    // (21:4) <Round rotate="0" margin="40">
    function create_default_slot(ctx) {
    	let arrow0;
    	let t;
    	let arrow1;
    	let current;

    	arrow0 = new Arrow({
    			props: {
    				from: "15",
    				to: "155",
    				color: "rose",
    				width: "5"
    			},
    			$$inline: true
    		});

    	arrow1 = new Arrow({
    			props: {
    				from: "195",
    				to: "345",
    				color: "rose",
    				width: "5"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(arrow0.$$.fragment);
    			t = space();
    			create_component(arrow1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(arrow0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(arrow1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrow0.$$.fragment, local);
    			transition_in(arrow1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrow0.$$.fragment, local);
    			transition_out(arrow1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(arrow0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(arrow1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(21:4) <Round rotate=\\\"0\\\" margin=\\\"40\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let a;
    	let t1;
    	let div1;
    	let round;
    	let current;

    	round = new Round({
    			props: {
    				rotate: "0",
    				margin: "40",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "somehow-circle";
    			t1 = space();
    			div1 = element("div");
    			create_component(round.$$.fragment);
    			set_style(a, "color", "steelblue");
    			set_style(a, "font-size", "20px");
    			attr_dev(a, "href", "https://github.com/spencermountain/somehow-circle");
    			add_location(a, file$6, 13, 4, 207);
    			attr_dev(div0, "class", "h3");
    			add_location(div0, file$6, 12, 2, 186);
    			attr_dev(div1, "class", "container svelte-1retagn");
    			add_location(div1, file$6, 19, 2, 362);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$6, 11, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, a);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(round, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const round_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				round_changes.$$scope = { dirty, ctx };
    			}

    			round.$set(round_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(round.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(round.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(round);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Demo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Demo", $$slots, []);
    	$$self.$capture_state = () => ({ Round, Arc, Line, Label, Circle, Arrow });
    	return [];
    }

    class Demo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1retagn-style")) add_css$1();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Demo",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new Demo({
      target: document.body
    });

    return app;

}());
