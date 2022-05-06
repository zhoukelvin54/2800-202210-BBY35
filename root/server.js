const express = require("express");
const session = require("express-session");
const filesys = require("fs");
const jsdom = require("jsdom");
const mysql2 = require("mysql2");
const http = require("http");
const https = require("https");
// tiny-editor requires that there be a document object from HTML; 
// as there is no HTML element just yet, it is safe to comment out
// const tinyeditor = require("tiny-editor"); 
const sanitize = require("sanitize-html");
const multer = require("multer");

console.log("This is when the server would start");