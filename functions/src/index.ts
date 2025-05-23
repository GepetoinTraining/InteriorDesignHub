/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

//import {onRequest} from "firebase-functions/v2/https";
//import * as logger from "firebase-functions/logger";

export { syncLeadConversion } from './firestore/leads'; // This might be removed or refactored later
export * from "./products";
export * from "./leads"; // Added for the new callable Lead functions
export * from "./prebudgets"; // Added for the new callable PreBudget functions
export * from "./users"; // Added for the new callable User functions
export * from "./tenants"; // Added for the new callable Tenant functions
export * from "./activities"; // Added for the new callable Activity functions
export * from "./productSales"; // Added for the new callable ProductSale functions
export * from "./admin"; // Added for admin-related functions
export * from "./clienteMasters"; // Added for ClienteMaster CRUD functions
export * from "./visitas"; // Added for Visita CRUD functions
export * from "./preBudgetItems"; // Added for PreBudgetItem CRUD functions

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
