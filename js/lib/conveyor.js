/**
 * The abstract logic templating engine.
 * @package Conveyor
 * @author Viktor Stanchev (me@viktorstanchev.com)
 */

function preg_quote(str, delimiter) {
    // Quote regular expression characters plus an optional character
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/preg_quote
    // +   original by: booeyOH
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: preg_quote("$40");
    // *     returns 1: '\$40'
    // *     example 2: preg_quote("*RRRING* Hello?");
    // *     returns 2: '\*RRRING\* Hello\?'
    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}

var Conveyor = {

    _pattern_to_regex: function(pattern) {
        var pieces = pattern.split(new RegExp("(?!=\\\\)\\/"));
        var result = '';
        for (var key in pieces) {
            var value = pieces[key];
            switch (value) {
            case '**':
                result += '\\/.+';
                break;
            case '*':
                result += '\\/[^\/]+';
                break;
            default:
                result += '\\/' + preg_quote(value);
            }
        }
        if (pattern.length > 0 && pattern[0] != '/') result = result.substring(2) + '$';
        else result = '^' + result.substring(2) + '$';
        return new RegExp(result, 'i');
    },

    _manipulate: function(logic, data, path) {
        var fn, pattern;
        if (path === '') {
            for (pattern in logic) {
                fn = logic[pattern];
                if ('/'.match(Conveyor._pattern_to_regex(pattern))) {
                    data = fn(data, '/');
                }
            }
        }
        if (data && (typeof data === 'object' || typeof data === 'array')) {
            for (var key in data) {
                var next_path = path + '/' + key.replace(new RegExp('/', 'g'), '\/');
                var matched = false;
                for (pattern in logic) {
                    fn = logic[pattern];
                    if (next_path.match(Conveyor._pattern_to_regex(pattern))) {
                        //matched!
                        matched = true;
                        var res = fn(data[key], next_path, key);
                        data[key] = res;
                    }
                }
            }
            for (key in data) {
                var result;
                var next_p = path + '/' + key.replace(new RegExp('/', 'g'), '\/');
                result = Conveyor._manipulate(logic, data[key], next_p);
                data[key] = result;
            }
        }
        return data;
    },

    make_namer: function(name) {
        //return a function that will name
        return function(data, path) {
            return Conveyor.name(data, name);
        };
    },

    name: function(obj, name) {
        var ret = {};
        ret[name] = obj;
        return ret;
    },

    make_setter: function(key, value) {
        return function(data, path) {
            return Conveyor.set(data, key, value);
        };
    },

    set: function(obj, key, value) {
        obj[key] = value;
        return obj;
    },

    make_rowifier: function(columns, name) {
        //return a function that will rowify
        return function(data, path) {
            return Conveyor.rowify(data, columns, name);
        };
    },

    rowify: function(data, columns, name) {
        var new_data = [];
        var dataCount = data.length;
        for (i = 0; i < dataCount; i += columns) {
            var accumulate = [];
            for (j = 0; j < columns && i + j < dataCount; j++) {
                accumulate.push(data[i + j]);
            }
            if (name && name !== '') {
                var obj = {};
                obj[name] = accumulate;
                new_data.push(obj);
            } else {
                new_data.push(accumulate);
            }
        }
        return new_data;
    },


    apply: function(data, logic) {
        if (typeof logic === 'object') {
            return Conveyor._manipulate(logic, data, '');
        } else {
            return Conveyor._manipulate({
                '/': logic
            }, data, '');
        }
    },

    render: function(template, data, logic, partials) {
        if (logic) data = Conveyor.apply(data, logic);

        return Mustache.to_html(template, data, partials);
    }
};

//TODO: rewrite conveyor to work nicely with creating a new object instead of using the old one
// the input would be an object with a special _ key anywhere in the tree pointing to a function
// the functions are evaluated bottom to top
// special keys such as * indicate that this function should run on every element in a list