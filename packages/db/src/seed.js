"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readUsersFromExcel = readUsersFromExcel;
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
var XLSX = require("xlsx");
var client_1 = require("./client");
var schema_1 = require("./schema");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
function readUsersFromExcel() {
    var filePath = path_1.default.resolve(__dirname, "suzu.xlsx");
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error("\u274C File not found: ".concat(filePath));
    }
    var buffer = fs_1.default.readFileSync(filePath);
    var workbook = XLSX.read(buffer, { type: "buffer" });
    var firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
        throw new Error("❌ No sheet names found in the workbook");
    }
    var sheet = workbook.Sheets[firstSheetName];
    if (!sheet) {
        throw new Error("❌ Sheet not found in the workbook");
    }
    var data = XLSX.utils.sheet_to_json(sheet, {
        defval: "", // Provide a default value for empty cells
    });
    return data;
}
function mapToIUser(raw) {
    var _a, _b, _c, _d, _e, _f;
    return {
        id: "random",
        firstName: (_a = raw["First Name [Required]"]) !== null && _a !== void 0 ? _a : "",
        lastName: (_b = raw["Last Name [Required]"]) !== null && _b !== void 0 ? _b : "",
        email: (_c = raw["Email Address [Required]"]) !== null && _c !== void 0 ? _c : "",
        phone: (_d = raw["Work Phone"]) !== null && _d !== void 0 ? _d : "",
        role: "user",
        status: (_f = (_e = raw["Status [READ ONLY]"]) === null || _e === void 0 ? void 0 : _e.toLowerCase()) !== null && _f !== void 0 ? _f : null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
var rawUsers = readUsersFromExcel();
var users = rawUsers.map(mapToIUser);
var usersInsert = JSON.stringify(users, null, 2);
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🌱 Seeding data...");
                    console.log("Insert Data..");
                    console.log("usersInsert", usersInsert);
                    return [4 /*yield*/, client_1.db.insert(schema_1.HRMUser).values([
                            {
                                firstName: "John",
                                lastName: "Doe",
                                email: "john.doe@example.com",
                                phone: "123-456-7890",
                                role: "user",
                                status: "active",
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        ])];
                case 1:
                    _a.sent();
                    console.log("✅ Done seeding!");
                    process.exit(0);
                    seed().catch(function (err) {
                        console.error("❌ Seed error:", err);
                        process.exit(1);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
