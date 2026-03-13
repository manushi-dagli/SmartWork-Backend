import { Router } from "express";
import { requireEmployeeAuth, requireSuperAdmin } from "../middleware/employeeAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as ctrl from "../controllers/inquiryConfig.controller.js";

const router = Router();

router.use(requireEmployeeAuth, requireSuperAdmin);

// Inquiry types (table: inquiry_types)
router.get("/inquiry-config/inquiry-types", asyncHandler(ctrl.listInquiryTypes));
router.get("/inquiry-config/inquiry-types/:id", asyncHandler(ctrl.getInquiryType));
router.post("/inquiry-config/inquiry-types", asyncHandler(ctrl.createInquiryType));
router.patch("/inquiry-config/inquiry-types/:id", asyncHandler(ctrl.updateInquiryType));
router.delete("/inquiry-config/inquiry-types/:id", asyncHandler(ctrl.deleteInquiryType));

// Document master
router.get("/inquiry-config/documents", asyncHandler(ctrl.listDocuments));
router.get("/inquiry-config/documents/:id", asyncHandler(ctrl.getDocument));
router.post("/inquiry-config/documents", asyncHandler(ctrl.createDocument));
router.patch("/inquiry-config/documents/:id", asyncHandler(ctrl.updateDocument));
router.delete("/inquiry-config/documents/:id", asyncHandler(ctrl.deleteDocument));

// Assignment term templates
router.get("/inquiry-config/assignment-term-templates", asyncHandler(ctrl.listAssignmentTermTemplates));
router.get("/inquiry-config/assignment-term-templates/:id", asyncHandler(ctrl.getAssignmentTermTemplate));
router.post("/inquiry-config/assignment-term-templates", asyncHandler(ctrl.createAssignmentTermTemplate));
router.patch("/inquiry-config/assignment-term-templates/:id", asyncHandler(ctrl.updateAssignmentTermTemplate));
router.delete("/inquiry-config/assignment-term-templates/:id", asyncHandler(ctrl.deleteAssignmentTermTemplate));

// Payment term templates
router.get("/inquiry-config/payment-term-templates", asyncHandler(ctrl.listPaymentTermTemplates));
router.get("/inquiry-config/payment-term-templates/:id", asyncHandler(ctrl.getPaymentTermTemplate));
router.post("/inquiry-config/payment-term-templates", asyncHandler(ctrl.createPaymentTermTemplate));
router.patch("/inquiry-config/payment-term-templates/:id", asyncHandler(ctrl.updatePaymentTermTemplate));
router.delete("/inquiry-config/payment-term-templates/:id", asyncHandler(ctrl.deletePaymentTermTemplate));

export const inquiryConfigRoutes = router;
