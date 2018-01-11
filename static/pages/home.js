/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// Copyright 2018 FOCUS Inc.All Rights Reserved.\n\n/**\r\n * @fileOverview UED-FE-Task\r\n * @author oneroundseven@gmail.com\r\n */\n\n__webpack_require__(1);\n\nvar a = '123';\n\n(function () {\n    var b = async function b() {\n        await new Promise(function (resolve, reject) {\n            setTimeout(function () {\n                console.log('wait me');\n                resolve();\n            }, 2000);\n        });\n        console.log('test hello');\n    };\n\n    b();\n})();//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9ob21lL2hvbWUuanM/Njg2YiJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiYSIsImIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNldFRpbWVvdXQiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUVBOzs7OztBQUtBLG1CQUFBQSxDQUFRLENBQVI7O0FBRUEsSUFBTUMsSUFBSSxLQUFWOztBQUVBLENBQUMsWUFBSztBQUNGLFFBQU1DLElBQUksZUFBSkEsQ0FBSSxHQUFpQjtBQUN2QixjQUFNLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDbkNDLHVCQUFXLFlBQUs7QUFDWkMsd0JBQVFDLEdBQVIsQ0FBWSxTQUFaO0FBQ0FKO0FBQ0gsYUFIRCxFQUdHLElBSEg7QUFJSCxTQUxLLENBQU47QUFNQUcsZ0JBQVFDLEdBQVIsQ0FBWSxZQUFaO0FBQ0gsS0FSRDs7QUFVQU47QUFDSCxDQVpEIiwiZmlsZSI6IjAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOCBGT0NVUyBJbmMuQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuXHJcbi8qKlxyXG4gKiBAZmlsZU92ZXJ2aWV3IFVFRC1GRS1UYXNrXHJcbiAqIEBhdXRob3Igb25lcm91bmRzZXZlbkBnbWFpbC5jb21cclxuICovXHJcblxyXG5yZXF1aXJlKCcuL2hvbWUuc2NzcycpO1xyXG5cclxuY29uc3QgYSA9ICcxMjMnO1xyXG5cclxuKCgpPT4ge1xyXG4gICAgY29uc3QgYiA9IGFzeW5jIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YWl0IG1lJyk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCd0ZXN0IGhlbGxvJyk7XHJcbiAgICB9XHJcblxyXG4gICAgYigpO1xyXG59KSgpO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3BhZ2VzL2hvbWUvaG9tZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///0\n");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

eval("// removed by extract-text-webpack-plugin//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9ob21lL2hvbWUuc2Nzcz9lYmYwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6IjEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcGFnZXMvaG9tZS9ob21lLnNjc3Ncbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///1\n");

/***/ })
/******/ ]);