export interface TicketComment {
    id: string;
    ticketId: string;
    authorUserId: string;
    authorName: string;
    body: string;
    isInternal: boolean;
    createdAt: string;
    attachments: TicketAttachment[];
  }
  
  export interface TicketAttachment {
    id: string;
    ticketId: string;
    ticketCommentId: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    storagePath: string;
    uploadedByUserId: string;
    uploadedByName: string;
    createdAt: string;
  }
  
  export interface TicketItem {
    id: string;
    ticketNumber: string;
    tenantId: string;
    departmentId: string;
    title: string;
    description: string;
    categoryId: string;
    categoryName: string;
    subCategoryId: string;
    subCategoryName: string;
    requesterUserId: string;
    requesterName: string;
    assignedUserId: string;
    assignedUserName: string;
    statusId: string;
    statusCode: string;
    statusName: string;
    priorityId: string;
    priorityCode: string;
    priorityName: string;
    sourceId: string;
    sourceCode: string;
    sourceName: string;
    slaId: string;
    slaName: string;
    firstResponseDueAt: string;
    resolutionDueAt: string;
    firstRespondedAt: string;
    resolvedAt: string;
    closedAt: string;
    lastActivityAt: string;
    createdAt: string;
    updatedAt: string;
    isFirstResponseBreached: boolean;
    isResolutionBreached: boolean;
    comments: TicketComment[];
    attachments: TicketAttachment[];
  }
  
  export interface DropdownItem {
    id: string;
    name: string;
  }