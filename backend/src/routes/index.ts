import { Router } from "express";
import { superAdminRoutes } from "./superAdmin.routes.js";
import { inquiryConfigRoutes } from "./inquiryConfig.routes.js";
import { inquiryRoutes } from "./inquiry.routes.js";
import { firmRoutes } from "./firm.routes.js";
import { roleRoutes } from "./role.routes.js";
import { familyRoutes } from "./family.routes.js";
import { clientRoutes } from "./client.routes.js";
import { employeeRoutes } from "./employee.routes.js";
import { profileRoutes } from "./profile.routes.js";

const apiRouter = Router();

apiRouter.use(superAdminRoutes);
apiRouter.use(inquiryConfigRoutes);
apiRouter.use(inquiryRoutes);
apiRouter.use(firmRoutes);
apiRouter.use(roleRoutes);
apiRouter.use(familyRoutes);
apiRouter.use(clientRoutes);
apiRouter.use(employeeRoutes);
apiRouter.use(profileRoutes);

export { apiRouter };
