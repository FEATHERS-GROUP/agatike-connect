import { d as requireReact, b as getDefaultExportFromCjs } from "./react.mjs";
import { r as requirePropTypes } from "./prop-types.mjs";
import { a as requireQRCode, r as requireErrorCorrectLevel } from "./qr.js.mjs";
var lib = {};
var QRCodeSvg = {};
var hasRequiredQRCodeSvg;
function requireQRCodeSvg() {
  if (hasRequiredQRCodeSvg) return QRCodeSvg;
  hasRequiredQRCodeSvg = 1;
  Object.defineProperty(QRCodeSvg, "__esModule", {
    value: true,
  });
  var _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  var _propTypes = /* @__PURE__ */ requirePropTypes();
  var _propTypes2 = _interopRequireDefault(_propTypes);
  var _react = requireReact();
  var _react2 = _interopRequireDefault(_react);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }
    return target;
  }
  var propTypes = {
    bgColor: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.string])
      .isRequired,
    bgD: _propTypes2.default.string.isRequired,
    fgColor: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.string])
      .isRequired,
    fgD: _propTypes2.default.string.isRequired,
    size: _propTypes2.default.number.isRequired,
    title: _propTypes2.default.string,
    viewBoxSize: _propTypes2.default.number.isRequired,
    xmlns: _propTypes2.default.string,
  };
  var QRCodeSvg$1 = (0, _react.forwardRef)(function (_ref, ref) {
    var bgColor = _ref.bgColor,
      bgD = _ref.bgD,
      fgD = _ref.fgD,
      fgColor = _ref.fgColor,
      size = _ref.size,
      title = _ref.title,
      viewBoxSize = _ref.viewBoxSize,
      _ref$xmlns = _ref.xmlns,
      xmlns = _ref$xmlns === void 0 ? "http://www.w3.org/2000/svg" : _ref$xmlns,
      props = _objectWithoutProperties(_ref, [
        "bgColor",
        "bgD",
        "fgD",
        "fgColor",
        "size",
        "title",
        "viewBoxSize",
        "xmlns",
      ]);
    return _react2.default.createElement(
      "svg",
      _extends({}, props, {
        height: size,
        ref,
        viewBox: "0 0 " + viewBoxSize + " " + viewBoxSize,
        width: size,
        xmlns,
      }),
      title ? _react2.default.createElement("title", null, title) : null,
      _react2.default.createElement("path", { d: bgD, fill: bgColor }),
      _react2.default.createElement("path", { d: fgD, fill: fgColor }),
    );
  });
  QRCodeSvg$1.displayName = "QRCodeSvg";
  QRCodeSvg$1.propTypes = propTypes;
  QRCodeSvg.default = QRCodeSvg$1;
  return QRCodeSvg;
}
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib) return lib;
  hasRequiredLib = 1;
  Object.defineProperty(lib, "__esModule", {
    value: true,
  });
  lib.QRCode = void 0;
  var _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  var _propTypes = /* @__PURE__ */ requirePropTypes();
  var _propTypes2 = _interopRequireDefault(_propTypes);
  var _ErrorCorrectLevel = requireErrorCorrectLevel();
  var _ErrorCorrectLevel2 = _interopRequireDefault(_ErrorCorrectLevel);
  var _QRCode = requireQRCode();
  var _QRCode2 = _interopRequireDefault(_QRCode);
  var _react = requireReact();
  var _react2 = _interopRequireDefault(_react);
  var _QRCodeSvg = requireQRCodeSvg();
  var _QRCodeSvg2 = _interopRequireDefault(_QRCodeSvg);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }
    return target;
  }
  function bytesToBinaryString(bytes) {
    return bytes
      .map(function (b) {
        return String.fromCharCode(b & 255);
      })
      .join("");
  }
  function encodeStringToUtf8Bytes(input) {
    return Array.from(new TextEncoder().encode(input));
  }
  var propTypes = {
    bgColor: _propTypes2.default.oneOfType([
      _propTypes2.default.object,
      _propTypes2.default.string,
    ]),
    fgColor: _propTypes2.default.oneOfType([
      _propTypes2.default.object,
      _propTypes2.default.string,
    ]),
    level: _propTypes2.default.string,
    size: _propTypes2.default.number,
    value: _propTypes2.default.string.isRequired,
  };
  var QRCode2 = (0, _react.forwardRef)(function (_ref, ref) {
    var _ref$bgColor = _ref.bgColor,
      bgColor = _ref$bgColor === void 0 ? "#FFFFFF" : _ref$bgColor,
      _ref$fgColor = _ref.fgColor,
      fgColor = _ref$fgColor === void 0 ? "#000000" : _ref$fgColor,
      _ref$level = _ref.level,
      level = _ref$level === void 0 ? "L" : _ref$level,
      _ref$size = _ref.size,
      size = _ref$size === void 0 ? 256 : _ref$size,
      value = _ref.value,
      props = _objectWithoutProperties(_ref, ["bgColor", "fgColor", "level", "size", "value"]);
    var qrcode = new _QRCode2.default(-1, _ErrorCorrectLevel2.default[level]);
    var utf8Bytes = encodeStringToUtf8Bytes(value);
    var binaryString = bytesToBinaryString(utf8Bytes);
    qrcode.addData(binaryString, "Byte");
    qrcode.make();
    var cells = qrcode.modules;
    return _react2.default.createElement(
      _QRCodeSvg2.default,
      _extends({}, props, {
        bgColor,
        bgD: cells
          .map(function (row, rowIndex) {
            return row
              .map(function (cell, cellIndex) {
                return !cell ? "M " + cellIndex + " " + rowIndex + " l 1 0 0 1 -1 0 Z" : "";
              })
              .join(" ");
          })
          .join(" "),
        fgColor,
        fgD: cells
          .map(function (row, rowIndex) {
            return row
              .map(function (cell, cellIndex) {
                return cell ? "M " + cellIndex + " " + rowIndex + " l 1 0 0 1 -1 0 Z" : "";
              })
              .join(" ");
          })
          .join(" "),
        ref,
        size,
        viewBoxSize: cells.length,
      }),
    );
  });
  lib.QRCode = QRCode2;
  QRCode2.displayName = "QRCode";
  QRCode2.propTypes = propTypes;
  lib.default = QRCode2;
  return lib;
}
var libExports = requireLib();
const QRCode = /* @__PURE__ */ getDefaultExportFromCjs(libExports);
export { QRCode as Q };
