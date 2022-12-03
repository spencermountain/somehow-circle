
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
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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

    var world = writable({
      maxR: 0,
      rotate: 0,
      world: {},
      q: Math.PI / 2,
    });
    // export default world

    /* src/Round.svelte generated by Svelte v3.24.1 */
    const file = "src/Round.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-1lnhtnf-style";
    	style.textContent = "path.svelte-1lnhtnf{pointer-events:all}path.svelte-1lnhtnf:hover{filter:drop-shadow(0px 1px 1px steelblue)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm91bmQuc3ZlbHRlIiwic291cmNlcyI6WyJSb3VuZC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgaW1wb3J0IHdvcmxkIGZyb20gJy4vd29ybGQuanMnXG5cbiAgZXhwb3J0IGxldCByYWRpdXMgPSA1MDBcbiAgZXhwb3J0IGxldCByb3RhdGUgPSAwXG4gIGV4cG9ydCBsZXQgZnJvbSA9IDBcbiAgZXhwb3J0IGxldCB0byA9IDM2MFxuICBleHBvcnQgbGV0IG1hcmdpbiA9IDBcbiAgcmFkaXVzID0gTnVtYmVyKHJhZGl1cylcblxuICB3b3JsZC51cGRhdGUoKG9iaikgPT4ge1xuICAgIG9iai5yYWRpdXMgPSByYWRpdXNcbiAgICBvYmoucm90YXRlID0gTnVtYmVyKHJvdGF0ZSlcbiAgICBvYmouZnJvbSA9IE51bWJlcihmcm9tKVxuICAgIG9iai50byA9IE51bWJlcih0bylcbiAgICBvYmoubWFyZ2luID0gTnVtYmVyKG1hcmdpbilcbiAgICByZXR1cm4gb2JqXG4gIH0pXG48L3NjcmlwdD5cblxuPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICA8c3ZnIHZpZXdCb3g9XCItNTAsLTUwLDEwMCwxMDBcIiBzaGFwZS1yZW5kZXJpbmc9XCJnZW9tZXRyaWNQcmVjaXNpb25cIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+XG4gICAgPCEtLSBhcnJvdy1oZWFkIC0tPlxuICAgIDxkZWZzPlxuICAgICAgPG1hcmtlclxuICAgICAgICBpZD1cInRyaWFuZ2xlXCJcbiAgICAgICAgdmlld0JveD1cIjAgMCAxMCAxMFwiXG4gICAgICAgIHJlZlg9XCI0XCJcbiAgICAgICAgcmVmWT1cIjZcIlxuICAgICAgICBtYXJrZXJVbml0cz1cInN0cm9rZVdpZHRoXCJcbiAgICAgICAgbWFya2VyV2lkdGg9XCI5XCJcbiAgICAgICAgbWFya2VySGVpZ2h0PVwiOVwiXG4gICAgICAgIG9yaWVudD1cImF1dG9cIlxuICAgICAgPlxuICAgICAgICA8cGF0aCBkPVwiTSAwIDAgTCAxMCA0IEwgMCAxMCB6XCIgZmlsbD1cIiNENjg4ODFcIiB0cmFuc2Zvcm09XCJyb3RhdGUoMjMpXCIgLz5cbiAgICAgIDwvbWFya2VyPlxuICAgIDwvZGVmcz5cblxuICAgIDxzbG90IC8+XG4gIDwvc3ZnPlxuPC9kaXY+XG5cbjxzdHlsZT5cbiAgcGF0aCB7XG4gICAgcG9pbnRlci1ldmVudHM6IGFsbDtcbiAgfVxuICBwYXRoOmhvdmVyIHtcbiAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KDBweCAxcHggMXB4IHN0ZWVsYmx1ZSk7XG4gIH1cbjwvc3R5bGU+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBMkNFLElBQUksZUFBQyxDQUFDLEFBQ0osY0FBYyxDQUFFLEdBQUcsQUFDckIsQ0FBQyxBQUNELG1CQUFJLE1BQU0sQUFBQyxDQUFDLEFBQ1YsTUFBTSxDQUFFLFlBQVksR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEFBQzVDLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    function create_fragment(ctx) {
    	let div;
    	let svg;
    	let defs;
    	let marker;
    	let path;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			marker = svg_element("marker");
    			path = svg_element("path");
    			if (default_slot) default_slot.c();
    			attr_dev(path, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path, "fill", "#D68881");
    			attr_dev(path, "transform", "rotate(23)");
    			attr_dev(path, "class", "svelte-1lnhtnf");
    			add_location(path, file, 34, 8, 761);
    			attr_dev(marker, "id", "triangle");
    			attr_dev(marker, "viewBox", "0 0 10 10");
    			attr_dev(marker, "refX", "4");
    			attr_dev(marker, "refY", "6");
    			attr_dev(marker, "markerUnits", "strokeWidth");
    			attr_dev(marker, "markerWidth", "9");
    			attr_dev(marker, "markerHeight", "9");
    			attr_dev(marker, "orient", "auto");
    			add_location(marker, file, 24, 6, 548);
    			add_location(defs, file, 23, 4, 535);
    			attr_dev(svg, "viewBox", "-50,-50,100,100");
    			attr_dev(svg, "shape-rendering", "geometricPrecision");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			add_location(svg, file, 21, 2, 411);
    			attr_dev(div, "class", "container");
    			add_location(div, file, 20, 0, 385);
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

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
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
    	let { radius = 500 } = $$props;
    	let { rotate = 0 } = $$props;
    	let { from = 0 } = $$props;
    	let { to = 360 } = $$props;
    	let { margin = 0 } = $$props;
    	radius = Number(radius);

    	world.update(obj => {
    		obj.radius = radius;
    		obj.rotate = Number(rotate);
    		obj.from = Number(from);
    		obj.to = Number(to);
    		obj.margin = Number(margin);
    		return obj;
    	});

    	const writable_props = ["radius", "rotate", "from", "to", "margin"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Round> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Round", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("radius" in $$props) $$invalidate(0, radius = $$props.radius);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("from" in $$props) $$invalidate(2, from = $$props.from);
    		if ("to" in $$props) $$invalidate(3, to = $$props.to);
    		if ("margin" in $$props) $$invalidate(4, margin = $$props.margin);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ world, radius, rotate, from, to, margin });

    	$$self.$inject_state = $$props => {
    		if ("radius" in $$props) $$invalidate(0, radius = $$props.radius);
    		if ("rotate" in $$props) $$invalidate(1, rotate = $$props.rotate);
    		if ("from" in $$props) $$invalidate(2, from = $$props.from);
    		if ("to" in $$props) $$invalidate(3, to = $$props.to);
    		if ("margin" in $$props) $$invalidate(4, margin = $$props.margin);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [radius, rotate, from, to, margin, $$scope, $$slots];
    }

    class Round extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1lnhtnf-style")) add_css();

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			radius: 0,
    			rotate: 1,
    			from: 2,
    			to: 3,
    			margin: 4
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

    const trig = [-Math.PI, Math.PI];

    const maxRadius = function (o) {
      let max = 0;
      let r = o.radius + o.width;
      if (r > max) {
        max = r;
      }
      return max
    };

    const makeScales = function (o) {
      let world$1 = get_store_value(world);
      let xScale = scaleLinear({ minmax: [world$1.from, world$1.to], world: trig });

      let max = maxRadius(o);
      max = max + world$1.margin;
      if (max > world$1.maxR) {
        world.update((wo) => {
          wo.maxR = max;
          return wo
        });
      }
      let rScale = scaleLinear({ minmax: [0, world$1.maxR], world: [0, 50] });
      return { xScale, rScale }
    };

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

    const drawArcs = function (obj, xScale, rScale) {
      let { q, rotate } = get_store_value(world);
      let r = rScale(obj.radius);
      let attrs = {
        startAngle: xScale(obj.to) - q + rotate,
        endAngle: xScale(obj.from) - q + rotate,
        innerRadius: r,
        outerRadius: r + rScale(obj.width)
      };
      let path = arc()(attrs);
      return { path }
    };

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
    	let path;
    	let path_d_value;
    	let path_stroke_width_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "link");
    			attr_dev(path, "d", path_d_value = /*res*/ ctx[1].path);
    			attr_dev(path, "stroke", "none");
    			attr_dev(path, "fill", /*color*/ ctx[0]);
    			attr_dev(path, "stroke-width", path_stroke_width_value = 1);
    			add_location(path, file$1, 27, 0, 611);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*res*/ 2 && path_d_value !== (path_d_value = /*res*/ ctx[1].path)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*color*/ 1) {
    				attr_dev(path, "fill", /*color*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
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
    	let { color = "blue" } = $$props;
    	color = colors[color] || color;

    	afterUpdate(() => {
    		let obj = {
    			color,
    			to: Number(to),
    			from: Number(from),
    			radius: Number(radius),
    			width: Number(width)
    		};

    		let { xScale, rScale } = makeScales(obj);
    		$$invalidate(1, res = drawArcs(obj, xScale, rScale));
    	});

    	const writable_props = ["to", "from", "radius", "width", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Arc> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Arc", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(2, to = $$props.to);
    		if ("from" in $$props) $$invalidate(3, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getScales: makeScales,
    		drawArc: drawArcs,
    		colors,
    		afterUpdate,
    		to,
    		from,
    		radius,
    		width,
    		color,
    		res
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(2, to = $$props.to);
    		if ("from" in $$props) $$invalidate(3, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("res" in $$props) $$invalidate(1, res = $$props.res);
    	};

    	let res;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(1, res = {});
    	return [color, res, to, from, radius, width];
    }

    class Arc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			to: 2,
    			from: 3,
    			radius: 4,
    			width: 5,
    			color: 0
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
    	let path;
    	let path_d_value;
    	let path_stroke_width_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "link");
    			attr_dev(path, "d", path_d_value = /*res*/ ctx[1].path);
    			attr_dev(path, "stroke", "none");
    			attr_dev(path, "fill", /*color*/ ctx[0]);
    			attr_dev(path, "stroke-width", path_stroke_width_value = 1);
    			add_location(path, file$2, 27, 0, 612);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*res*/ 2 && path_d_value !== (path_d_value = /*res*/ ctx[1].path)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*color*/ 1) {
    				attr_dev(path, "fill", /*color*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
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
    	let { width = 20 } = $$props;
    	let { color = "blue" } = $$props;
    	color = colors[color] || color;

    	afterUpdate(() => {
    		let obj = {
    			color,
    			to: Number(to),
    			from: Number(from),
    			radius: Number(radius),
    			width: Number(width)
    		};

    		let { xScale, rScale } = makeScales(obj);
    		$$invalidate(1, res = drawArcs(obj, xScale, rScale));
    	});

    	const writable_props = ["to", "from", "radius", "width", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Circle> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Circle", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(2, to = $$props.to);
    		if ("from" in $$props) $$invalidate(3, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getScales: makeScales,
    		drawArc: drawArcs,
    		colors,
    		afterUpdate,
    		to,
    		from,
    		radius,
    		width,
    		color,
    		res
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(2, to = $$props.to);
    		if ("from" in $$props) $$invalidate(3, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("res" in $$props) $$invalidate(1, res = $$props.res);
    	};

    	let res;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(1, res = {});
    	return [color, res, to, from, radius, width];
    }

    class Circle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			to: 2,
    			from: 3,
    			radius: 4,
    			width: 5,
    			color: 0
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

    const drawLines = function (obj, xScale, rScale) {
      let { q, rotate } = get_store_value(world);
      // draw lines
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
    };

    /* src/Line.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/Line.svelte";

    function create_fragment$3(ctx) {
    	let path;
    	let path_d_value;
    	let path_stroke_value;
    	let path_fill_value;
    	let path_stroke_width_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "link");
    			attr_dev(path, "d", path_d_value = /*res*/ ctx[0].path);
    			attr_dev(path, "stroke", path_stroke_value = /*res*/ ctx[0].color);
    			attr_dev(path, "fill", path_fill_value = /*res*/ ctx[0].color);
    			attr_dev(path, "stroke-width", path_stroke_width_value = /*res*/ ctx[0].width);
    			add_location(path, file$3, 25, 0, 581);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*res*/ 1 && path_d_value !== (path_d_value = /*res*/ ctx[0].path)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*res*/ 1 && path_stroke_value !== (path_stroke_value = /*res*/ ctx[0].color)) {
    				attr_dev(path, "stroke", path_stroke_value);
    			}

    			if (dirty & /*res*/ 1 && path_fill_value !== (path_fill_value = /*res*/ ctx[0].color)) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (dirty & /*res*/ 1 && path_stroke_width_value !== (path_stroke_width_value = /*res*/ ctx[0].width)) {
    				attr_dev(path, "stroke-width", path_stroke_width_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
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
    	let { radius = 80 } = $$props;
    	let { width = 20 } = $$props;
    	let { color = "blue" } = $$props;
    	color = colors[color] || color;

    	afterUpdate(() => {
    		let obj = {
    			color,
    			angle: Number(angle),
    			radius: Number(radius),
    			length: Number(length),
    			width: Number(width)
    		};

    		let { xScale, rScale } = makeScales(obj);
    		$$invalidate(0, res = drawLines(obj, xScale, rScale));
    	});

    	const writable_props = ["radius", "width", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Line> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Line", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getScales: makeScales,
    		colors,
    		drawLine: drawLines,
    		afterUpdate,
    		radius,
    		width,
    		color,
    		res
    	});

    	$$self.$inject_state = $$props => {
    		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("res" in $$props) $$invalidate(0, res = $$props.res);
    	};

    	let res;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(0, res = {});
    	return [res, color, radius, width];
    }

    class Line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { radius: 2, width: 3, color: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$3.name
    		});
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

    const findPoint = function (angle, r) {
      return {
        x: r * Math.sin(angle),
        y: -r * Math.cos(angle)
      }
    };

    const drawLabels = function (obj, xScale, rScale) {
      let { q, rotate } = get_store_value(world);
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
    };

    /* src/Label.svelte generated by Svelte v3.24.1 */
    const file$4 = "src/Label.svelte";

    function create_fragment$4(ctx) {
    	let text_1;
    	let raw_value = /*res*/ ctx[0].text + "";
    	let text_1_x_value;
    	let text_1_y_value;
    	let text_1_transform_value;
    	let text_1_font_size_value;
    	let text_1_text_anchor_value;
    	let text_1_fill_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			attr_dev(text_1, "x", text_1_x_value = /*res*/ ctx[0].x);
    			attr_dev(text_1, "y", text_1_y_value = /*res*/ ctx[0].y);
    			attr_dev(text_1, "transform", text_1_transform_value = "rotate(" + /*res*/ ctx[0].angle + "," + /*res*/ ctx[0].x + "," + /*res*/ ctx[0].y + ")");
    			attr_dev(text_1, "font-size", text_1_font_size_value = /*res*/ ctx[0].size);
    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*res*/ ctx[0].align);
    			attr_dev(text_1, "fill", text_1_fill_value = /*res*/ ctx[0].color);
    			add_location(text_1, file$4, 32, 0, 758);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			text_1.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*res*/ 1 && raw_value !== (raw_value = /*res*/ ctx[0].text + "")) text_1.innerHTML = raw_value;
    			if (dirty & /*res*/ 1 && text_1_x_value !== (text_1_x_value = /*res*/ ctx[0].x)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*res*/ 1 && text_1_y_value !== (text_1_y_value = /*res*/ ctx[0].y)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*res*/ 1 && text_1_transform_value !== (text_1_transform_value = "rotate(" + /*res*/ ctx[0].angle + "," + /*res*/ ctx[0].x + "," + /*res*/ ctx[0].y + ")")) {
    				attr_dev(text_1, "transform", text_1_transform_value);
    			}

    			if (dirty & /*res*/ 1 && text_1_font_size_value !== (text_1_font_size_value = /*res*/ ctx[0].size)) {
    				attr_dev(text_1, "font-size", text_1_font_size_value);
    			}

    			if (dirty & /*res*/ 1 && text_1_text_anchor_value !== (text_1_text_anchor_value = /*res*/ ctx[0].align)) {
    				attr_dev(text_1, "text-anchor", text_1_text_anchor_value);
    			}

    			if (dirty & /*res*/ 1 && text_1_fill_value !== (text_1_fill_value = /*res*/ ctx[0].color)) {
    				attr_dev(text_1, "fill", text_1_fill_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
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

    	afterUpdate(() => {
    		let obj = {
    			text,
    			color,
    			align,
    			angle: Number(angle),
    			radius: Number(radius),
    			size: Number(size),
    			rotate: Number(rotate)
    		};

    		let { xScale, rScale } = makeScales(obj);
    		$$invalidate(0, res = drawLabels(obj, xScale, rScale));
    	});

    	const writable_props = ["angle", "at", "radius", "rotate", "size", "align", "text", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Label> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Label", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("angle" in $$props) $$invalidate(1, angle = $$props.angle);
    		if ("at" in $$props) $$invalidate(3, at = $$props.at);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("rotate" in $$props) $$invalidate(5, rotate = $$props.rotate);
    		if ("size" in $$props) $$invalidate(6, size = $$props.size);
    		if ("align" in $$props) $$invalidate(7, align = $$props.align);
    		if ("text" in $$props) $$invalidate(8, text = $$props.text);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getScales: makeScales,
    		colors,
    		afterUpdate,
    		drawLabel: drawLabels,
    		angle,
    		at,
    		radius,
    		rotate,
    		size,
    		align,
    		text,
    		color,
    		res
    	});

    	$$self.$inject_state = $$props => {
    		if ("angle" in $$props) $$invalidate(1, angle = $$props.angle);
    		if ("at" in $$props) $$invalidate(3, at = $$props.at);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("rotate" in $$props) $$invalidate(5, rotate = $$props.rotate);
    		if ("size" in $$props) $$invalidate(6, size = $$props.size);
    		if ("align" in $$props) $$invalidate(7, align = $$props.align);
    		if ("text" in $$props) $$invalidate(8, text = $$props.text);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    		if ("res" in $$props) $$invalidate(0, res = $$props.res);
    	};

    	let res;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(0, res = {});
    	return [res, angle, color, at, radius, rotate, size, align, text];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			angle: 1,
    			at: 3,
    			radius: 4,
    			rotate: 5,
    			size: 6,
    			align: 7,
    			text: 8,
    			color: 2
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
    	let path;
    	let path_d_value;
    	let path_stroke_width_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "link");
    			attr_dev(path, "d", path_d_value = /*res*/ ctx[1].path);
    			attr_dev(path, "stroke", "none");
    			attr_dev(path, "fill", /*color*/ ctx[0]);
    			attr_dev(path, "stroke-width", path_stroke_width_value = 1);
    			attr_dev(path, "marker-end", "url(#triangle)");
    			add_location(path, file$5, 27, 0, 611);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*res*/ 2 && path_d_value !== (path_d_value = /*res*/ ctx[1].path)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*color*/ 1) {
    				attr_dev(path, "fill", /*color*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
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
    	let { color = "blue" } = $$props;
    	color = colors[color] || color;

    	afterUpdate(() => {
    		let obj = {
    			color,
    			to: Number(to),
    			from: Number(from),
    			radius: Number(radius),
    			width: Number(width)
    		};

    		let { xScale, rScale } = makeScales(obj);
    		$$invalidate(1, res = drawArcs(obj, xScale, rScale));
    	});

    	const writable_props = ["to", "from", "radius", "width", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Arrow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Arrow", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(2, to = $$props.to);
    		if ("from" in $$props) $$invalidate(3, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getScales: makeScales,
    		drawArc: drawArcs,
    		colors,
    		afterUpdate,
    		to,
    		from,
    		radius,
    		width,
    		color,
    		res
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(2, to = $$props.to);
    		if ("from" in $$props) $$invalidate(3, from = $$props.from);
    		if ("radius" in $$props) $$invalidate(4, radius = $$props.radius);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("res" in $$props) $$invalidate(1, res = $$props.res);
    	};

    	let res;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(1, res = {});
    	return [color, res, to, from, radius, width];
    }

    class Arrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			to: 2,
    			from: 3,
    			radius: 4,
    			width: 5,
    			color: 0
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

    const { console: console_1 } = globals;
    const file$6 = "Demo.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-1retagn-style";
    	style.textContent = ".container.svelte-1retagn{width:50%;border:1px solid grey}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVtby5zdmVsdGUiLCJzb3VyY2VzIjpbIkRlbW8uc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGltcG9ydCB7IFJvdW5kLCBBcmMsIExpbmUsIExhYmVsLCBDaXJjbGUsIEFycm93IH0gZnJvbSAnLi9zcmMnXG4gIGxldCB3ID0gMjBcbiAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdjaGFuZ2UnKVxuICAgIHcgPSBNYXRoLnJhbmRvbSgpICogMjAwXG4gIH0sIDEwMDApXG48L3NjcmlwdD5cblxuPGRpdiBjbGFzcz1cImNvbFwiPlxuICA8ZGl2IGNsYXNzPVwiaDNcIj5cbiAgICA8YVxuICAgICAgc3R5bGU9XCJjb2xvcjpzdGVlbGJsdWU7IGZvbnQtc2l6ZToyMHB4O1wiXG4gICAgICBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3NwZW5jZXJtb3VudGFpbi9zb21laG93LWNpcmNsZVwiXG4gICAgPlxuICAgICAgc29tZWhvdy1jaXJjbGVcbiAgICA8L2E+XG4gIDwvZGl2PlxuICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgPFJvdW5kIHJvdGF0ZT1cIjBcIiBtYXJnaW49XCI0MFwiPlxuICAgICAgPEFycm93IGZyb209XCIxNVwiIHRvPXt3fSBjb2xvcj1cInJvc2VcIiB3aWR0aD1cIjVcIiAvPlxuICAgICAgPEFycm93IGZyb209XCIxOTVcIiB0bz1cIjM0NVwiIGNvbG9yPVwiZ3JlZW5cIiB3aWR0aD1cIjVcIiAvPlxuICAgICAgPExhYmVsIGFuZ2xlPVwiMTgwXCIgcmFkaXVzPVwiOTBcIiB0ZXh0PVwiVUlcIiBjb2xvcj1cImdyZXlcIiBzaXplPVwiNFwiIC8+XG4gICAgICA8TGFiZWwgYW5nbGU9XCIwXCIgcmFkaXVzPVwiMTEwXCIgdGV4dD1cIkFyY2FuZSBDTElcIiBjb2xvcj1cImdyZXlcIiBzaXplPVwiNFwiIC8+XG4gICAgPC9Sb3VuZD5cbiAgPC9kaXY+XG48L2Rpdj5cblxuPHN0eWxlPlxuICAuY29udGFpbmVyIHtcbiAgICB3aWR0aDogNTAlO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGdyZXk7XG4gIH1cbjwvc3R5bGU+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBNkJFLFVBQVUsZUFBQyxDQUFDLEFBQ1YsS0FBSyxDQUFFLEdBQUcsQ0FDVixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEFBQ3hCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    // (20:4) <Round rotate="0" margin="40">
    function create_default_slot(ctx) {
    	let arrow0;
    	let t0;
    	let arrow1;
    	let t1;
    	let label0;
    	let t2;
    	let label1;
    	let current;

    	arrow0 = new Arrow({
    			props: {
    				from: "15",
    				to: /*w*/ ctx[0],
    				color: "rose",
    				width: "5"
    			},
    			$$inline: true
    		});

    	arrow1 = new Arrow({
    			props: {
    				from: "195",
    				to: "345",
    				color: "green",
    				width: "5"
    			},
    			$$inline: true
    		});

    	label0 = new Label({
    			props: {
    				angle: "180",
    				radius: "90",
    				text: "UI",
    				color: "grey",
    				size: "4"
    			},
    			$$inline: true
    		});

    	label1 = new Label({
    			props: {
    				angle: "0",
    				radius: "110",
    				text: "Arcane CLI",
    				color: "grey",
    				size: "4"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(arrow0.$$.fragment);
    			t0 = space();
    			create_component(arrow1.$$.fragment);
    			t1 = space();
    			create_component(label0.$$.fragment);
    			t2 = space();
    			create_component(label1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(arrow0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(arrow1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(label0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(label1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const arrow0_changes = {};
    			if (dirty & /*w*/ 1) arrow0_changes.to = /*w*/ ctx[0];
    			arrow0.$set(arrow0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrow0.$$.fragment, local);
    			transition_in(arrow1.$$.fragment, local);
    			transition_in(label0.$$.fragment, local);
    			transition_in(label1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrow0.$$.fragment, local);
    			transition_out(arrow1.$$.fragment, local);
    			transition_out(label0.$$.fragment, local);
    			transition_out(label1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(arrow0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(arrow1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(label0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(label1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(20:4) <Round rotate=\\\"0\\\" margin=\\\"40\\\">",
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
    			add_location(a, file$6, 11, 4, 226);
    			attr_dev(div0, "class", "h3");
    			add_location(div0, file$6, 10, 2, 205);
    			attr_dev(div1, "class", "container svelte-1retagn");
    			add_location(div1, file$6, 18, 2, 386);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$6, 9, 0, 185);
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

    			if (dirty & /*$$scope, w*/ 3) {
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
    	let w = 20;

    	setInterval(
    		() => {
    			console.log("change");
    			$$invalidate(0, w = Math.random() * 200);
    		},
    		1000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Demo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Demo", $$slots, []);

    	$$self.$capture_state = () => ({
    		Round,
    		Arc,
    		Line,
    		Label,
    		Circle,
    		Arrow,
    		w
    	});

    	$$self.$inject_state = $$props => {
    		if ("w" in $$props) $$invalidate(0, w = $$props.w);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [w];
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
