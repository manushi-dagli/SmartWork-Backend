import { Router } from "express";
import { requireEmployeeAuth, requireAbility, requireCanCreateInquiry } from "../middleware/employeeAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as ctrl from "../controllers/inquiry.controller.js";

const router = Router();

router.use(requireEmployeeAuth);

// Staff read-only config (must be before /:id to avoid matching "inquiry-types" as id)
router.get(
  "/inquiries/inquiry-types",
  requireAbility("read", "Client"),
  asyncHandler(ctrl.listInquiryTypesForStaff)
);
router.get(
  "/inquiries/documents",
  requireAbility("read", "Client"),
  asyncHandler(ctrl.listDocumentsForStaff)
);
router.get(
  "/inquiries/documents-by-type/:inquiryTypeId",
  requireAbility("read", "Client"),
  asyncHandler(ctrl.getDocumentsByInquiryType)
);
router.get(
  "/inquiries/assignment-term-templates",
  requireAbility("read", "Client"),
  asyncHandler(ctrl.listAssignmentTermTemplatesForStaff)
);
router.get(
  "/inquiries/payment-term-templates",
  requireAbility("read", "Client"),
  asyncHandler(ctrl.listPaymentTermTemplatesForStaff)
);

// Inquiry CRUD and actions
router.get("/inquiries", requireAbility("read", "Client"), asyncHandler(ctrl.listInquiries));
router.post("/inquiries", requireCanCreateInquiry, asyncHandler(ctrl.createInquiry));
router.get("/inquiries/:id", requireAbility("read", "Client"), asyncHandler(ctrl.getInquiry));
router.patch("/inquiries/:id", requireAbility("update", "Client"), asyncHandler(ctrl.updateInquiry));
router.post(
  "/inquiries/:id/documents",
  requireAbility("update", "Client"),
  asyncHandler(ctrl.setInquiryDocuments)
);
router.get(
  "/inquiries/:id/documents",
  requireAbility("read", "Client"),
  asyncHandler(ctrl.getInquiryDocuments)
);
router.post("/inquiries/:id/send", requireAbility("update", "Client"), asyncHandler(ctrl.markInquirySent));
router.post("/inquiries/:id/accept", requireAbility("create", "Client"), asyncHandler(ctrl.acceptInquiry));
router.post("/inquiries/:id/reject", requireAbility("update", "Client"), asyncHandler(ctrl.rejectInquiry));

export const inquiryRoutes = router;
