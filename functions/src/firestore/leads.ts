import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';


admin.initializeApp();
const prisma = new PrismaClient();

export const syncLeadConversion = onDocumentUpdated('leads/{leadId}', async (event) => {
  // const before = event.data?.before?.data();
  // const after = event.data?.after?.data();
  // const context = event;

  // if (!before || !after) return;

  // if (before.status !== 'CONVERTED' && after.status === 'CONVERTED') {
  //   await prisma.leadConversion.create({
  //     data: {
  //       leadId: context.params.leadId,
  //       tenantId: after.tenantId,
  //       convertedAt: after.convertedAt ?? new Date(),
  //     },
  //   });
  //   console.log(`Lead ${context.params.leadId} synced to Neon.`);
  // }
  console.log("syncLeadConversion function execution skipped as this logic is now handled by the updateLead callable function.");
});
