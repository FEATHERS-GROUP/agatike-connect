import { d as requireReact, b as getDefaultExportFromCjs } from "./react.mjs";
import { r as requireJsBarcode } from "./jsbarcode.mjs";
import { r as requirePropTypes } from "./prop-types.mjs";
var reactBarcode;
var hasRequiredReactBarcode;
function requireReactBarcode() {
  if (hasRequiredReactBarcode) return reactBarcode;
  hasRequiredReactBarcode = 1;
  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof2(obj2) {
        return typeof obj2;
      };
    } else {
      _typeof = function _typeof2(obj2) {
        return obj2 &&
          typeof Symbol === "function" &&
          obj2.constructor === Symbol &&
          obj2 !== Symbol.prototype
          ? "symbol"
          : typeof obj2;
      };
    }
    return _typeof(obj);
  }
  var _react = _interopRequireDefault(requireReact());
  var _jsbarcode = _interopRequireDefault(requireJsBarcode());
  var _propTypes = _interopRequireDefault(/* @__PURE__ */ requirePropTypes());
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    return Constructor;
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    }
    return _assertThisInitialized(self);
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf
      ? Object.getPrototypeOf
      : function _getPrototypeOf2(o2) {
          return o2.__proto__ || Object.getPrototypeOf(o2);
        };
    return _getPrototypeOf(o);
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: { value: subClass, writable: true, configurable: true },
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf =
      Object.setPrototypeOf ||
      function _setPrototypeOf2(o2, p2) {
        o2.__proto__ = p2;
        return o2;
      };
    return _setPrototypeOf(o, p);
  }
  var getDOMNode;
  var version = _react["default"].version.split(/[.-]/);
  if (version[0] === "0" && (version[1] === "13" || version[1] === "12")) {
    getDOMNode = function getDOMNode2(ref) {
      return ref.getDOMNode();
    };
  } else {
    getDOMNode = function getDOMNode2(ref) {
      return ref;
    };
  }
  var Barcode2 = /* @__PURE__ */ (function (_React$Component) {
    _inherits(Barcode3, _React$Component);
    function Barcode3(props) {
      var _this;
      _classCallCheck(this, Barcode3);
      _this = _possibleConstructorReturn(this, _getPrototypeOf(Barcode3).call(this, props));
      _this.renderElementRef = _react["default"].createRef();
      _this.update = _this.update.bind(_assertThisInitialized(_this));
      return _this;
    }
    _createClass(Barcode3, [
      {
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps) {
          var _this2 = this;
          return Object.keys(Barcode3.propTypes).some(function (k) {
            return _this2.props[k] !== nextProps[k];
          });
        },
      },
      {
        key: "componentDidMount",
        value: function componentDidMount() {
          this.update();
        },
      },
      {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
          this.update();
        },
      },
      {
        key: "update",
        value: function update() {
          var renderElement = getDOMNode(this.renderElementRef.current);
          try {
            new _jsbarcode["default"](
              renderElement,
              this.props.value,
              Object.assign(
                {
                  text: this.props.text || this.props.value,
                },
                this.props,
              ),
            );
          } catch (e) {
            window.console.error(e);
          }
        },
      },
      {
        key: "render",
        value: function render() {
          var _this$props = this.props,
            id = _this$props.id,
            className = _this$props.className;
          if (this.props.renderer === "svg") {
            return _react["default"].createElement("svg", {
              ref: this.renderElementRef,
              id,
              className,
            });
          } else if (this.props.renderer === "canvas") {
            return _react["default"].createElement("canvas", {
              ref: this.renderElementRef,
              id,
              className,
            });
          } else if (this.props.renderer === "img") {
            return _react["default"].createElement("img", {
              ref: this.renderElementRef,
              id,
              className,
            });
          }
        },
      },
    ]);
    return Barcode3;
  })(_react["default"].Component);
  Barcode2.propTypes = {
    value: _propTypes["default"].string.isRequired,
    text: _propTypes["default"].string,
    renderer: _propTypes["default"].string,
    format: _propTypes["default"].string,
    width: _propTypes["default"].number,
    height: _propTypes["default"].number,
    displayValue: _propTypes["default"].bool,
    fontOptions: _propTypes["default"].string,
    font: _propTypes["default"].string,
    textAlign: _propTypes["default"].string,
    textPosition: _propTypes["default"].string,
    textMargin: _propTypes["default"].number,
    fontSize: _propTypes["default"].number,
    background: _propTypes["default"].string,
    lineColor: _propTypes["default"].string,
    margin: _propTypes["default"].number,
    marginTop: _propTypes["default"].number,
    marginBottom: _propTypes["default"].number,
    marginLeft: _propTypes["default"].number,
    marginRight: _propTypes["default"].number,
    id: _propTypes["default"].string,
    className: _propTypes["default"].string,
    ean128: _propTypes["default"].bool,
  };
  Barcode2.defaultProps = {
    format: "CODE128",
    renderer: "svg",
    width: 2,
    height: 100,
    displayValue: true,
    fontOptions: "",
    font: "monospace",
    textAlign: "center",
    textPosition: "bottom",
    textMargin: 2,
    fontSize: 20,
    background: "#ffffff",
    lineColor: "#000000",
    margin: 10,
    className: "",
    ean128: false,
  };
  reactBarcode = Barcode2;
  return reactBarcode;
}
var reactBarcodeExports = requireReactBarcode();
const Barcode = /* @__PURE__ */ getDefaultExportFromCjs(reactBarcodeExports);
export { Barcode as B };
