const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

origin: [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://smart-hospital-sigma.vercel.app"
]

app.use(
  cors({
    origin: allowedOrigins,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
  })
);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

/* =========================================================
   HOSPITALS
========================================================= */

const hospitals = [
  {
    id: "H001",
    name: "Bengaluru Central",
    code: "BGC",
    city: "Bengaluru",
    address: "Central Bengaluru",
    lat: 12.9716,
    lon: 77.5946,
    contact: "+91 80 4000 1001",
    emergencyCapacity: 72,
    active: true,
  },
  {
    id: "H002",
    name: "Mysuru General",
    code: "MYG",
    city: "Mysuru",
    address: "Mysuru",
    lat: 12.2958,
    lon: 76.6394,
    contact: "+91 82 1240 2002",
    emergencyCapacity: 61,
    active: true,
  },
  {
    id: "H003",
    name: "Mangaluru Medical",
    code: "MGM",
    city: "Mangaluru",
    address: "Mangaluru",
    lat: 12.9141,
    lon: 74.856,
    contact: "+91 82 4240 3003",
    emergencyCapacity: 48,
    active: true,
  },
];

/* =========================================================
   DEPARTMENTS
========================================================= */

const departments = [
  {
    id: "D001",
    name: "Critical Care",
    code: "CCU",
    hospitalId: "H001",
  },
  {
    id: "D002",
    name: "Blood Bank",
    code: "BB",
    hospitalId: "H001",
  },
  {
    id: "D003",
    name: "Critical Care",
    code: "CCU",
    hospitalId: "H002",
  },
  {
    id: "D004",
    name: "Blood Bank",
    code: "BB",
    hospitalId: "H002",
  },
  {
    id: "D005",
    name: "Emergency Equipment",
    code: "EE",
    hospitalId: "H003",
  },
];

/* =========================================================
   RESOURCES
========================================================= */

const resources = [
  {
    id: "R001",
    name: "ICU Beds",
    type: "BED",
    bloodGroup: null,
    unit: "beds",
    totalQuantity: 40,
    availableQuantity: 8,
    reservedQuantity: 2,
    criticalThreshold: 10,
    hospitalId: "H001",
    departmentId: "D001",
    status: "CRITICAL",
  },
  {
    id: "R002",
    name: "General Beds",
    type: "BED",
    bloodGroup: null,
    unit: "beds",
    totalQuantity: 140,
    availableQuantity: 116,
    reservedQuantity: 6,
    criticalThreshold: 25,
    hospitalId: "H001",
    departmentId: "D001",
    status: "AVAILABLE",
  },
  {
    id: "R003",
    name: "O- Blood",
    type: "BLOOD",
    bloodGroup: "O_NEGATIVE",
    unit: "units",
    totalQuantity: 25,
    availableQuantity: 12,
    reservedQuantity: 1,
    criticalThreshold: 5,
    hospitalId: "H001",
    departmentId: "D002",
    status: "LOW",
  },
  {
    id: "R004",
    name: "ICU Beds",
    type: "BED",
    bloodGroup: null,
    unit: "beds",
    totalQuantity: 40,
    availableQuantity: 24,
    reservedQuantity: 2,
    criticalThreshold: 10,
    hospitalId: "H002",
    departmentId: "D003",
    status: "AVAILABLE",
  },
  {
    id: "R005",
    name: "O- Blood",
    type: "BLOOD",
    bloodGroup: "O_NEGATIVE",
    unit: "units",
    totalQuantity: 30,
    availableQuantity: 22,
    reservedQuantity: 2,
    criticalThreshold: 6,
    hospitalId: "H002",
    departmentId: "D004",
    status: "AVAILABLE",
  },
  {
    id: "R006",
    name: "Ventilators",
    type: "EQUIPMENT",
    bloodGroup: null,
    unit: "units",
    totalQuantity: 25,
    availableQuantity: 18,
    reservedQuantity: 1,
    criticalThreshold: 5,
    hospitalId: "H003",
    departmentId: "D005",
    status: "AVAILABLE",
  },
];

/* =========================================================
   REQUESTS
========================================================= */

let requests = [
  {
    id: "REQ001",
    resourceType: "BLOOD",
    bloodGroup: "O_NEGATIVE",
    quantity: 5,
    urgency: "CRITICAL",
    status: "PENDING",
    description: "Emergency trauma requirement",
    destinationHospital: "Bengaluru Central",
    destinationHospitalId: "H001",
    sourceHospital: null,
    sourceHospitalId: null,
    createdBy: "Hospital Coordinator",
    createdById: "U002",
    smartMatchScore: null,
    distanceKm: null,
    createdAt: new Date(
      Date.now() - 55 * 60000
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - 55 * 60000
    ).toISOString(),
  },
  {
    id: "REQ002",
    resourceType: "BED",
    bloodGroup: null,
    quantity: 3,
    urgency: "HIGH",
    status: "MATCHED",
    description: "ICU bed requirement",
    destinationHospital: "Mysuru General",
    destinationHospitalId: "H002",
    sourceHospital: "Bengaluru Central",
    sourceHospitalId: "H001",
    createdBy: "Hospital Coordinator",
    createdById: "U002",
    smartMatchScore: 89,
    distanceKm: 145.3,
    createdAt: new Date(
      Date.now() - 4 * 3600000
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - 3 * 3600000
    ).toISOString(),
  },
];

let lendingTransactions = [];

/* =========================================================
   AUDIT
========================================================= */

let auditEvents = [
  {
    id: "AUD001",
    action: "SYSTEM_STARTED",
    entityType: "SYSTEM",
    entityId: "NEXUSCARE",
    details:
      "NexusCare coordination network initialized",
    hospitalId: null,
    userId: null,
    quantityBefore: null,
    quantityAfter: null,
    createdAt: new Date().toISOString(),
  },
];

/* =========================================================
   NOTIFICATIONS
========================================================= */

let notifications = [
  {
    id: "N001",
    hospitalId: "H001",
    userId: null,
    title: "Critical ICU Capacity",
    message:
      "Bengaluru Central has only 8 ICU beds available. Capacity is below the critical threshold.",
    severity: "CRITICAL",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

/* =========================================================
   HELPERS
========================================================= */

function nextId(prefix, collection) {
  return (
    prefix +
    String(collection.length + 1).padStart(3, "0")
  );
}

function hospitalById(id) {
  return hospitals.find(
    (hospital) => hospital.id === id
  );
}

function hospitalByName(name) {
  if (!name) return null;

  return hospitals.find(
    (hospital) =>
      hospital.name.toLowerCase() ===
      String(name)
        .trim()
        .toLowerCase()
  );
}

function resourceById(id) {
  return resources.find(
    (resource) => resource.id === id
  );
}

function resourceByName(name) {
  if (!name) return null;

  return resources.find(
    (resource) =>
      resource.name.toLowerCase() ===
      String(name)
        .trim()
        .toLowerCase()
  );
}

function getResourceStatus(resource) {
  if (resource.availableQuantity <= 0) {
    return "UNAVAILABLE";
  }

  if (
    resource.availableQuantity <=
    resource.criticalThreshold
  ) {
    return "CRITICAL";
  }

  if (
    resource.availableQuantity <=
    resource.criticalThreshold * 2.5
  ) {
    return "LOW";
  }

  return "AVAILABLE";
}

function updateResourceStatus(resource) {
  resource.status =
    getResourceStatus(resource);
}

function distanceKm(a, b) {
  if (!a || !b) {
    return 999;
  }

  const R = 6371;

  const dLat =
    ((b.lat - a.lat) * Math.PI) /
    180;

  const dLon =
    ((b.lon - a.lon) * Math.PI) /
    180;

  const lat1 =
    (a.lat * Math.PI) /
    180;

  const lat2 =
    (b.lat * Math.PI) /
    180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(x),
      Math.sqrt(1 - x)
    )
  );
}

function createAudit({
  action,
  entityType,
  entityId,
  details,
  hospitalId = null,
  userId = null,
  quantityBefore = null,
  quantityAfter = null,
}) {
  const event = {
    id: nextId(
      "AUD",
      auditEvents
    ),
    action,
    entityType,
    entityId,
    details,
    hospitalId,
    userId,
    quantityBefore,
    quantityAfter,
    createdAt:
      new Date().toISOString(),
  };

  auditEvents.unshift(event);

  io.emit(
    "audit-created",
    event
  );

  return event;
}

function createNotification({
  hospitalId = null,
  userId = null,
  title,
  message,
  severity = "INFO",
}) {
  const notification = {
    id: nextId(
      "N",
      notifications
    ),
    hospitalId,
    userId,
    title,
    message,
    severity,
    isRead: false,
    createdAt:
      new Date().toISOString(),
  };

  notifications.unshift(
    notification
  );

  io.emit(
    "notification-created",
    notification
  );

  return notification;
}

function hospitalResourceSummary(
  hospitalId
) {
  const items =
    resources.filter(
      (resource) =>
        resource.hospitalId ===
        hospitalId
    );

  items.forEach(
    updateResourceStatus
  );

  return {
    totalResources:
      items.length,

    availableResources:
      items.filter(
        (resource) =>
          resource.status ===
          "AVAILABLE"
      ).length,

    lowResources:
      items.filter(
        (resource) =>
          resource.status ===
          "LOW"
      ).length,

    criticalResources:
      items.filter(
        (resource) =>
          resource.status ===
          "CRITICAL"
      ).length,

    unavailableResources:
      items.filter(
        (resource) =>
          resource.status ===
          "UNAVAILABLE"
      ).length,
  };
}

/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      service:
        "NexusCare Backend",
      status: "running",
      timestamp:
        new Date().toISOString(),
    });
  }
);

/* =========================================================
   HOSPITALS
========================================================= */

app.get(
  "/api/hospitals",
  (req, res) => {
    res.json(
      hospitals.map(
        (hospital) => ({
          ...hospital,
          resourceSummary:
            hospitalResourceSummary(
              hospital.id
            ),
        })
      )
    );
  }
);

/* =========================================================
   DEPARTMENTS
========================================================= */

app.get(
  "/api/departments",
  (req, res) => {
    res.json(departments);
  }
);

/* =========================================================
   RESOURCES
========================================================= */

app.get(
  "/api/resources",
  (req, res) => {
    resources.forEach(
      updateResourceStatus
    );

    res.json(resources);
  }
);

app.put(
  "/api/resources/:id",
  (req, res) => {
    const resource =
      resourceById(
        req.params.id
      );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    const before =
      resource.availableQuantity;

    if (
      typeof req.body
        .availableQuantity ===
      "number"
    ) {
      resource.availableQuantity =
        Math.max(
          0,
          Math.min(
            resource.totalQuantity,
            req.body
              .availableQuantity
          )
        );
    }

    if (
      typeof req.body
        .reservedQuantity ===
      "number"
    ) {
      resource.reservedQuantity =
        Math.max(
          0,
          req.body
            .reservedQuantity
        );
    }

    updateResourceStatus(
      resource
    );

    createAudit({
      action:
        "RESOURCE_UPDATED",
      entityType:
        "RESOURCE",
      entityId:
        resource.id,
      details:
        `Updated ${resource.name}`,
      hospitalId:
        resource.hospitalId,
      quantityBefore:
        before,
      quantityAfter:
        resource.availableQuantity,
    });

    if (
      resource.status ===
        "CRITICAL" &&
      before !==
        resource.availableQuantity
    ) {
      createNotification({
        hospitalId:
          resource.hospitalId,
        title:
          "Critical Resource Level",
        message:
          `${resource.name} is now at ` +
          `${resource.availableQuantity} ` +
          `${resource.unit}.`,
        severity:
          "CRITICAL",
      });
    }

    io.emit(
      "resource-updated",
      resource
    );

    io.emit(
      "network-updated"
    );

    res.json({
      success: true,
      resource,
      data: resource,
    });
  }
);

/* =========================================================
   GET REQUESTS
========================================================= */

app.get(
  "/api/requests",
  (req, res) => {
    res.json(
      [...requests].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      )
    );
  }
);

/* =========================================================
   GET REQUEST BY ID
========================================================= */

app.get(
  "/api/requests/:id",
  (req, res) => {
    const request =
      requests.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }

    res.json({
      success: true,
      request,
      data: request,
      lending:
        lendingTransactions.filter(
          (item) =>
            item.requestId ===
            request.id
        ),
    });
  }
);

/* =========================================================
   CREATE REQUEST
========================================================= */

app.post(
  "/api/requests",
  (req, res) => {
    const body =
      req.body || {};

    let resourceType =
      body.resourceType ??
      body.type ??
      body.resourceTypeName ??
      null;

    const resourceName =
      body.resource ??
      body.resourceName ??
      body.item ??
      null;

    const quantity =
      Number(
        body.quantity ??
          body.requestedQuantity ??
          body.amount
      );

    let destinationHospital =
      body.destinationHospital ??
      body.hospital ??
      body.hospitalName ??
      body.destination ??
      body.toHospital ??
      null;

    let destinationHospitalId =
      body.destinationHospitalId ??
      body.hospitalId ??
      body.destinationId ??
      body.toHospitalId ??
      null;

    const bloodGroup =
      body.bloodGroup ??
      body.blood ??
      null;

    const urgency =
      String(
        body.urgency ??
          body.priority ??
          "MEDIUM"
      ).toUpperCase();

    const description =
      body.description ??
      body.reason ??
      body.notes ??
      "";

    const createdBy =
      body.createdBy ??
      "Hospital Coordinator";

    const createdById =
      body.createdById ??
      "U002";

    /* -----------------------------------------------------
       Hospital object support
    ----------------------------------------------------- */

    if (
      destinationHospital &&
      typeof destinationHospital ===
        "object"
    ) {
      destinationHospitalId =
        destinationHospital.id ??
        destinationHospitalId;

      destinationHospital =
        destinationHospital.name ??
        destinationHospital.hospitalName ??
        null;
    }

    /* -----------------------------------------------------
       Resolve hospital
    ----------------------------------------------------- */

    let destination = null;

    if (
      destinationHospitalId
    ) {
      destination =
        hospitalById(
          destinationHospitalId
        );
    }

    if (
      !destination &&
      destinationHospital
    ) {
      destination =
        hospitalByName(
          destinationHospital
        );
    }

    /* -----------------------------------------------------
       Resolve resource type
    ----------------------------------------------------- */

    if (
      !resourceType &&
      resourceName
    ) {
      const found =
        resourceByName(
          resourceName
        );

      if (found) {
        resourceType =
          found.type;
      }
    }

    if (!resourceType) {
      const text =
        String(
          resourceName || ""
        ).toLowerCase();

      if (
        text.includes("blood")
      ) {
        resourceType =
          "BLOOD";
      } else if (
        text.includes("icu") ||
        text.includes("bed")
      ) {
        resourceType =
          "BED";
      } else if (
        text.includes(
          "ventilator"
        ) ||
        text.includes(
          "equipment"
        )
      ) {
        resourceType =
          "EQUIPMENT";
      }
    }

    /* -----------------------------------------------------
       Validation
    ----------------------------------------------------- */

    if (
      !resourceType ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !destination
    ) {
      return res.status(400).json({
        success: false,
        message:
          "resourceType, quantity and destinationHospital are required",
        received: {
          resourceType,
          resourceName,
          quantity,
          destinationHospital,
          destinationHospitalId,
        },
      });
    }

    /* -----------------------------------------------------
       Create request
    ----------------------------------------------------- */

    const request = {
      id: nextId(
        "REQ",
        requests
      ),

      resourceType:
        String(
          resourceType
        ).toUpperCase(),

      bloodGroup,

      quantity,

      urgency,

      status:
        "PENDING",

      description,

      destinationHospital:
        destination.name,

      destinationHospitalId:
        destination.id,

      sourceHospital:
        null,

      sourceHospitalId:
        null,

      createdBy,

      createdById,

      smartMatchScore:
        null,

      distanceKm:
        null,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    requests.unshift(
      request
    );

    /* -----------------------------------------------------
       Audit
    ----------------------------------------------------- */

    createAudit({
      action:
        "REQUEST_CREATED",

      entityType:
        "REQUEST",

      entityId:
        request.id,

      details:
        `${request.urgency} request for ` +
        `${request.quantity} ` +
        `${
          request.bloodGroup ||
          request.resourceType
        }`,

      hospitalId:
        destination.id,

      userId:
        createdById,

      quantityBefore:
        null,

      quantityAfter:
        request.quantity,
    });

    /* -----------------------------------------------------
       Notification
    ----------------------------------------------------- */

    let severity =
      "INFO";

    if (
      request.urgency ===
      "CRITICAL"
    ) {
      severity =
        "CRITICAL";
    } else if (
      request.urgency ===
      "HIGH"
    ) {
      severity =
        "WARNING";
    }

    createNotification({
      hospitalId:
        destination.id,

      userId:
        createdById,

      title:
        request.urgency ===
        "CRITICAL"
          ? "Critical Emergency Request"
          : "New Resource Request",

      message:
        `${destination.name} requested ` +
        `${request.quantity} ` +
        `${
          request.bloodGroup ||
          request.resourceType
        }. Request ID: ` +
        `${request.id}.`,

      severity,
    });

    /* -----------------------------------------------------
       REALTIME EVENTS
    ----------------------------------------------------- */

    io.emit(
      "request-created",
      request
    );

    io.emit(
      "emergency-request-created",
      request
    );

    io.emit(
      "network-updated"
    );

    /* =====================================================
       IMPORTANT:
       Return both request AND data
       because current page.tsx reads:

       data.data.id
    ===================================================== */

    return res.status(201).json({
      success: true,

      message:
        "Request created successfully",

      request,

      data: request,

      id: request.id,

      resourceType:
        request.resourceType,

      bloodGroup:
        request.bloodGroup,

      quantity:
        request.quantity,

      urgency:
        request.urgency,

      status:
        request.status,

      destinationHospital:
        request.destinationHospital,

      destinationHospitalId:
        request.destinationHospitalId,
    });
  }
);

/* =========================================================
   REQUEST STATUS
========================================================= */

app.put(
  "/api/requests/:id/status",
  (req, res) => {
    const request =
      requests.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Request not found",
      });
    }

    const previousStatus =
      request.status;

    request.status =
      req.body.status ||
      request.status;

    request.updatedAt =
      new Date().toISOString();

    createAudit({
      action:
        "REQUEST_STATUS_CHANGED",
      entityType:
        "REQUEST",
      entityId:
        request.id,
      details:
        `${previousStatus} -> ` +
        `${request.status}`,
      hospitalId:
        request.destinationHospitalId,
    });

    createNotification({
      hospitalId:
        request.destinationHospitalId,
      title:
        "Request Status Updated",
      message:
        `${request.id} changed from ` +
        `${previousStatus} to ` +
        `${request.status}.`,
      severity:
        request.status ===
        "FULFILLED"
          ? "INFO"
          : "WARNING",
    });

    io.emit(
      "request-status-updated",
      request
    );

    io.emit(
      "network-updated"
    );

    res.json({
      success: true,
      request,
      data: request,
    });
  }
);

/* =========================================================
   SMART MATCH
========================================================= */

app.post(
  "/api/smart-match",
  (req, res) => {
    const resourceType =
      String(
        req.body.resourceType ??
          req.body.type ??
          ""
      ).toUpperCase();

    const bloodGroup =
      req.body.bloodGroup ??
      null;

    const quantity =
      Number(
        req.body.quantity ??
          req.body.requestedQuantity
      );

    const requestId =
      req.body.requestId ??
      null;

    const excludeHospital =
      req.body.excludeHospital ??
      req.body.hospital ??
      null;

    const destinationHospital =
      req.body.destinationHospital ??
      null;

    if (
      !resourceType ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "resourceType and quantity are required",
      });
    }

    let targetHospital =
      destinationHospital
        ? hospitalByName(
            destinationHospital
          )
        : null;

    if (requestId) {
      const linked =
        requests.find(
          (request) =>
            request.id ===
            requestId
        );

      if (linked) {
        targetHospital =
          hospitalById(
            linked.destinationHospitalId
          );
      }
    }

    const excluded =
      excludeHospital
        ? hospitalByName(
            excludeHospital
          )
        : null;

    const candidates =
      resources
        .filter((resource) => {
          if (
            resource.type !==
            resourceType
          ) {
            return false;
          }

          if (
            bloodGroup &&
            resource.bloodGroup !==
              bloodGroup
          ) {
            return false;
          }

          if (
            resource.availableQuantity <
            quantity
          ) {
            return false;
          }

          if (
            excluded &&
            resource.hospitalId ===
              excluded.id
          ) {
            return false;
          }

          return true;
        })
        .map((resource) => {
          const hospital =
            hospitalById(
              resource.hospitalId
            );

          const distance =
            targetHospital
              ? distanceKm(
                  targetHospital,
                  hospital
                )
              : 0;

          const surplus =
            resource.availableQuantity -
            quantity;

          const availabilityScore =
            Math.min(
              40,
              surplus * 2
            );

          const distanceScore =
            Math.max(
              0,
              35 -
                distance / 5
            );

          const loadScore =
            Math.max(
              0,
              25 -
                hospital.emergencyCapacity /
                  4
            );

          const score =
            Math.round(
              availabilityScore +
                distanceScore +
                loadScore
            );

          return {
            resource,
            hospital,
            distanceKm:
              Number(
                distance.toFixed(1)
              ),
            surplus,
            score,
            reasons: [
              `${surplus} units remain after transfer`,
              `${Number(
                distance.toFixed(1)
              )} km estimated distance`,
              `Emergency capacity ${hospital.emergencyCapacity}%`,
            ],
          };
        })
        .sort(
          (a, b) =>
            b.score - a.score
        );

    const best =
      candidates[0];

    if (!best) {
      return res.status(404).json({
        success: false,
        message:
          "No viable hospital has enough available resources",
        candidates: [],
      });
    }

    let linkedRequestId =
      requestId;

    if (
      !linkedRequestId &&
      targetHospital
    ) {
      const matching =
        requests
          .filter(
            (request) =>
              request.destinationHospitalId ===
                targetHospital.id &&
              request.status ===
                "PENDING" &&
              request.resourceType ===
                resourceType &&
              request.quantity <=
                quantity &&
              (!request.bloodGroup ||
                request.bloodGroup ===
                  bloodGroup)
          )
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ) -
              new Date(
                a.createdAt
              )
          )[0];

      if (matching) {
        linkedRequestId =
          matching.id;
      }
    }

    if (linkedRequestId) {
      const request =
        requests.find(
          (item) =>
            item.id ===
            linkedRequestId
        );

      if (request) {
        request.sourceHospital =
          best.hospital.name;

        request.sourceHospitalId =
          best.hospital.id;

        request.smartMatchScore =
          best.score;

        request.distanceKm =
          best.distanceKm;

        request.status =
          "MATCHED";

        request.updatedAt =
          new Date().toISOString();

        createAudit({
          action:
            "SMART_MATCH",
          entityType:
            "REQUEST",
          entityId:
            request.id,
          details:
            `Matched with ${best.hospital.name} using score ${best.score}`,
          hospitalId:
            request.destinationHospitalId,
        });

        createNotification({
          hospitalId:
            request.destinationHospitalId,
          title:
            "Smart Match Found",
          message:
            `${best.hospital.name} can supply ` +
            `${request.quantity} ` +
            `${
              request.bloodGroup ||
              request.resourceType
            } for ${request.id}.`,
          severity:
            "INFO",
        });

        io.emit(
          "request-status-updated",
          request
        );
      }
    }

    const result = {
      success: true,
      hospital:
        best.hospital.name,
      hospitalId:
        best.hospital.id,
      resource:
        best.resource.name,
      resourceId:
        best.resource.id,
      score:
        best.score,
      distanceKm:
        best.distanceKm,
      availableQuantity:
        best.resource
          .availableQuantity,
      surplus:
        best.surplus,
      reasons:
        best.reasons,
      requestId:
        linkedRequestId ||
        null,
    };

    io.emit(
      "smart-match-created",
      result
    );

    res.json(result);
  }
);

/* =========================================================
   LENDING
========================================================= */

app.get(
  "/api/lending",
  (req, res) => {
    res.json(
      [...lendingTransactions].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      )
    );
  }
);

app.post(
  "/api/lending",
  (req, res) => {
    const {
      requestId = null,
      fromHospital,
      toHospital,
      resource,
      quantity,
      notes = "",
      requestedBy =
        "Hospital Coordinator",
    } = req.body;

    const transferQuantity =
      Number(quantity);

    if (
      !fromHospital ||
      !toHospital ||
      !resource ||
      !Number.isFinite(
        transferQuantity
      ) ||
      transferQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "fromHospital, toHospital, resource and quantity are required",
      });
    }

    const source =
      hospitalByName(
        fromHospital
      );

    const destination =
      hospitalByName(
        toHospital
      );

    if (
      !source ||
      !destination
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Source or destination hospital not found",
      });
    }

    const sourceResource =
      resources.find(
        (item) =>
          item.hospitalId ===
            source.id &&
          item.name.toLowerCase() ===
            String(
              resource
            ).toLowerCase()
      );

    if (!sourceResource) {
      return res.status(404).json({
        success: false,
        message:
          "Source resource not found",
      });
    }

    if (
      sourceResource.availableQuantity <
      transferQuantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient source inventory for this transfer",
      });
    }

    let linkedRequest =
      requestId
        ? requests.find(
            (request) =>
              request.id ===
              requestId
          )
        : null;

    if (!linkedRequest) {
      linkedRequest =
        requests
          .filter(
            (request) =>
              request.destinationHospitalId ===
                destination.id &&
              request.status ===
                "PENDING" &&
              request.resourceType ===
                sourceResource.type &&
              request.quantity <=
                transferQuantity &&
              (!request.bloodGroup ||
                request.bloodGroup ===
                  sourceResource.bloodGroup)
          )
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ) -
              new Date(
                a.createdAt
              )
          )[0];
    }

    if (
      linkedRequest &&
      lendingTransactions.some(
        (transaction) =>
          transaction.requestId ===
            linkedRequest.id &&
          [
            "REQUESTED",
            "ACCEPTED",
          ].includes(
            transaction.status
          )
      )
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An active lending transaction already exists for this request",
      });
    }

    const transaction = {
      id: nextId(
        "LEND",
        lendingTransactions
      ),

      requestId:
        linkedRequest?.id ||
        null,

      fromHospital:
        source.name,

      fromHospitalId:
        source.id,

      toHospital:
        destination.name,

      toHospitalId:
        destination.id,

      resource:
        sourceResource.name,

      resourceId:
        sourceResource.id,

      resourceType:
        sourceResource.type,

      bloodGroup:
        sourceResource.bloodGroup,

      quantity:
        transferQuantity,

      status:
        "REQUESTED",

      notes,

      requestedBy,

      acceptedBy:
        null,

      completedBy:
        null,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    lendingTransactions.unshift(
      transaction
    );

    if (linkedRequest) {
      linkedRequest.sourceHospital =
        source.name;

      linkedRequest.sourceHospitalId =
        source.id;

      linkedRequest.status =
        "MATCHED";

      linkedRequest.updatedAt =
        new Date().toISOString();
    }

    createAudit({
      action:
        "LENDING_CREATED",
      entityType:
        "LENDING",
      entityId:
        transaction.id,
      details:
        `${source.name} -> ${destination.name}: ${transferQuantity} ${sourceResource.name}`,
      hospitalId:
        source.id,
    });

    createNotification({
      hospitalId:
        destination.id,
      title:
        "Resource Lending Request",
      message:
        `${source.name} initiated ${transferQuantity} ${sourceResource.name} to ${destination.name}.`,
      severity:
        "INFO",
    });

    createNotification({
      hospitalId:
        source.id,
      title:
        "Lending Request Created",
      message:
        `Transfer ${transaction.id} is awaiting acceptance.`,
      severity:
        "INFO",
    });

    io.emit(
      "lending-request-created",
      transaction
    );

    io.emit(
      "network-updated"
    );

    res.status(201).json({
      success: true,
      transaction,
      data: transaction,
    });
  }
);

/* =========================================================
   ACCEPT LENDING
========================================================= */

app.put(
  "/api/lending/:id/accept",
  (req, res) => {
    const transaction =
      lendingTransactions.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message:
          "Lending transaction not found",
      });
    }

    if (
      transaction.status !==
      "REQUESTED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only REQUESTED transactions can be accepted",
      });
    }

    transaction.status =
      "ACCEPTED";

    transaction.acceptedBy =
      req.body.acceptedBy ||
      "Hospital Coordinator";

    transaction.updatedAt =
      new Date().toISOString();

    createAudit({
      action:
        "LENDING_ACCEPTED",
      entityType:
        "LENDING",
      entityId:
        transaction.id,
      details:
        `${transaction.toHospital} accepted ${transaction.id}`,
      hospitalId:
        transaction.toHospitalId,
    });

    createNotification({
      hospitalId:
        transaction.fromHospitalId,
      title:
        "Lending Accepted",
      message:
        `${transaction.toHospital} accepted ${transaction.id}.`,
      severity:
        "INFO",
    });

    createNotification({
      hospitalId:
        transaction.toHospitalId,
      title:
        "Transfer Accepted",
      message:
        `${transaction.id} is ready for receipt.`,
      severity:
        "INFO",
    });

    io.emit(
      "lending-status-updated",
      transaction
    );

    res.json({
      success: true,
      transaction,
      data: transaction,
    });
  }
);

/* =========================================================
   COMPLETE LENDING
========================================================= */

app.put(
  "/api/lending/:id/complete",
  (req, res) => {
    const transaction =
      lendingTransactions.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message:
          "Lending transaction not found",
      });
    }

    if (
      transaction.status !==
      "ACCEPTED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only ACCEPTED transactions can be completed",
      });
    }

    const sourceResource =
      resourceById(
        transaction.resourceId
      );

    if (!sourceResource) {
      return res.status(404).json({
        success: false,
        message:
          "Source resource not found",
      });
    }

    if (
      sourceResource.availableQuantity <
      transaction.quantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Source resource no longer has enough inventory",
      });
    }

    const before =
      sourceResource.availableQuantity;

    sourceResource.availableQuantity -=
      transaction.quantity;

    updateResourceStatus(
      sourceResource
    );

    transaction.status =
      "COMPLETED";

    transaction.completedBy =
      req.body.completedBy ||
      "Hospital Coordinator";

    transaction.updatedAt =
      new Date().toISOString();

    let destinationResource =
      resources.find(
        (item) =>
          item.hospitalId ===
            transaction.toHospitalId &&
          item.name ===
            transaction.resource
      );

    if (destinationResource) {
      destinationResource.availableQuantity +=
        transaction.quantity;

      destinationResource.totalQuantity +=
        transaction.quantity;

      updateResourceStatus(
        destinationResource
      );
    } else {
      destinationResource = {
        id: nextId(
          "R",
          resources
        ),
        name:
          transaction.resource,
        type:
          transaction.resourceType,
        bloodGroup:
          transaction.bloodGroup,
        unit:
          "units",
        totalQuantity:
          transaction.quantity,
        availableQuantity:
          transaction.quantity,
        reservedQuantity:
          0,
        criticalThreshold:
          5,
        hospitalId:
          transaction.toHospitalId,
        departmentId:
          null,
        status:
          "AVAILABLE",
      };

      resources.push(
        destinationResource
      );
    }

    createAudit({
      action:
        "LENDING_COMPLETED",
      entityType:
        "LENDING",
      entityId:
        transaction.id,
      details:
        `${transaction.quantity} ${transaction.resource} transferred`,
      hospitalId:
        transaction.fromHospitalId,
      quantityBefore:
        before,
      quantityAfter:
        sourceResource.availableQuantity,
    });

    createAudit({
      action:
        "RESOURCE_RECEIVED",
      entityType:
        "RESOURCE",
      entityId:
        destinationResource.id,
      details:
        `${transaction.toHospital} received ${transaction.quantity} ${transaction.resource}`,
      hospitalId:
        transaction.toHospitalId,
      quantityBefore:
        destinationResource.availableQuantity -
        transaction.quantity,
      quantityAfter:
        destinationResource.availableQuantity,
    });

    const request =
      transaction.requestId
        ? requests.find(
            (item) =>
              item.id ===
              transaction.requestId
          )
        : null;

    if (request) {
      request.status =
        "FULFILLED";

      request.updatedAt =
        new Date().toISOString();

      createAudit({
        action:
          "REQUEST_FULFILLED",
        entityType:
          "REQUEST",
        entityId:
          request.id,
        details:
          `Request fulfilled through ${transaction.id}`,
        hospitalId:
          request.destinationHospitalId,
      });

      createNotification({
        hospitalId:
          request.destinationHospitalId,
        title:
          "Emergency Request Fulfilled",
        message:
          `${request.id} has been fulfilled.`,
        severity:
          "INFO",
      });

      io.emit(
        "request-status-updated",
        request
      );
    }

    createNotification({
      hospitalId:
        transaction.toHospitalId,
      title:
        "Resource Received",
      message:
        `${transaction.toHospital} received ${transaction.quantity} ${transaction.resource}.`,
      severity:
        "INFO",
    });

    createNotification({
      hospitalId:
        transaction.fromHospitalId,
      title:
        "Transfer Completed",
      message:
        `${transaction.id} completed successfully.`,
      severity:
        "INFO",
    });

    io.emit(
      "lending-status-updated",
      transaction
    );

    io.emit(
      "resource-updated",
      sourceResource
    );

    io.emit(
      "resource-updated",
      destinationResource
    );

    io.emit(
      "network-updated"
    );

    res.json({
      success: true,
      transaction,
      request,
      sourceResource,
      destinationResource,
      data: {
        transaction,
        request,
        sourceResource,
        destinationResource,
      },
    });
  }
);

/* =========================================================
   CANCEL LENDING
========================================================= */

app.put(
  "/api/lending/:id/cancel",
  (req, res) => {
    const transaction =
      lendingTransactions.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message:
          "Lending transaction not found",
      });
    }

    if (
      [
        "COMPLETED",
        "CANCELLED",
      ].includes(
        transaction.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This transaction cannot be cancelled",
      });
    }

    transaction.status =
      "CANCELLED";

    transaction.updatedAt =
      new Date().toISOString();

    const request =
      transaction.requestId
        ? requests.find(
            (item) =>
              item.id ===
              transaction.requestId
          )
        : null;

    if (
      request &&
      request.status !==
        "FULFILLED"
    ) {
      request.status =
        "PENDING";

      request.updatedAt =
        new Date().toISOString();

      io.emit(
        "request-status-updated",
        request
      );
    }

    createAudit({
      action:
        "LENDING_CANCELLED",
      entityType:
        "LENDING",
      entityId:
        transaction.id,
      details:
        `Transfer ${transaction.id} cancelled`,
      hospitalId:
        transaction.toHospitalId,
    });

    createNotification({
      hospitalId:
        transaction.toHospitalId,
      title:
        "Lending Cancelled",
      message:
        `${transaction.id} has been cancelled.`,
      severity:
        "WARNING",
    });

    io.emit(
      "lending-status-updated",
      transaction
    );

    res.json({
      success: true,
      transaction,
      data: transaction,
    });
  }
);

/* =========================================================
   ACTIVITY
========================================================= */

app.get(
  "/api/activity",
  (req, res) => {
    const activity = [
      ...requests.map(
        (request) => ({
          id:
            `REQACT-${request.id}`,
          type:
            "REQUEST",
          action:
            "REQUEST",
          title:
            `${request.id} · ${request.resourceType}`,
          description:
            `${request.quantity} ${
              request.bloodGroup ||
              ""
            } ${request.resourceType} request`,
          status:
            request.status,
          createdAt:
            request.createdAt,
          metadata:
            request,
        })
      ),

      ...lendingTransactions.map(
        (transaction) => ({
          id:
            `LENDACT-${transaction.id}`,
          type:
            "LENDING",
          action:
            transaction.status,
          title:
            `${transaction.id} · ${transaction.resource}`,
          description:
            `${transaction.fromHospital} → ${transaction.toHospital}`,
          status:
            transaction.status,
          createdAt:
            transaction.createdAt,
          metadata:
            transaction,
        })
      ),

      ...auditEvents.map(
        (audit) => ({
          id:
            `AUDITACT-${audit.id}`,
          type:
            "AUDIT",
          action:
            audit.action,
          title:
            audit.action,
          description:
            audit.details,
          status:
            null,
          createdAt:
            audit.createdAt,
          metadata:
            audit,
        })
      ),
    ].sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.json(activity);
  }
);

/* =========================================================
   AUDIT
========================================================= */

app.get(
  "/api/audit",
  (req, res) => {
    res.json(
      [...auditEvents].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      )
    );
  }
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

app.get(
  "/api/notifications",
  (req, res) => {
    res.json(
      [...notifications].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      )
    );
  }
);

app.put(
  "/api/notifications/:id/read",
  (req, res) => {
    const notification =
      notifications.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    notification.isRead =
      true;

    res.json({
      success: true,
      notification,
      data: notification,
    });
  }
);

/* =========================================================
   PREDICTION
========================================================= */

app.get(
  "/api/prediction/:resourceId",
  (req, res) => {
    const resource =
      resourceById(
        req.params.resourceId
      );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    const burnRates = {
      R001: 2.5,
      R002: 5.5,
      R003: 1.4,
      R004: 1.8,
      R005: 1.1,
      R006: 2.2,
    };

    const burnRate =
      burnRates[
        resource.id
      ] || 1;

    const remainingHours =
      resource.availableQuantity /
      burnRate;

    let risk =
      "SAFE";

    if (
      remainingHours <= 4 &&
      remainingHours > 2
    ) {
      risk =
        "WARNING";
    }

    if (
      remainingHours <= 2
    ) {
      risk =
        "CRITICAL";
    }

    res.json({
      success: true,
      resourceId:
        resource.id,
      resource:
        resource.name,
      currentQuantity:
        resource.availableQuantity,
      burnRatePerHour:
        burnRate,
      estimatedRemainingHours:
        Number(
          remainingHours.toFixed(
            1
          )
        ),
      risk,
      method:
        "Predictive burn-rate analysis",
    });
  }
);

/* =========================================================
   SUMMARY
========================================================= */

app.get(
  "/api/summary",
  (req, res) => {
    resources.forEach(
      updateResourceStatus
    );

    res.json({
      success: true,

      hospitals:
        hospitals.length,

      criticalResources:
        resources.filter(
          (resource) =>
            resource.status ===
            "CRITICAL"
        ).length,

      lowResources:
        resources.filter(
          (resource) =>
            resource.status ===
            "LOW"
        ).length,

      activeRequests:
        requests.filter(
          (request) =>
            ![
              "FULFILLED",
              "CANCELLED",
            ].includes(
              request.status
            )
        ).length,

      activeLending:
        lendingTransactions.filter(
          (transaction) =>
            [
              "REQUESTED",
              "ACCEPTED",
            ].includes(
              transaction.status
            )
        ).length,

      fulfilledRequests:
        requests.filter(
          (request) =>
            request.status ===
            "FULFILLED"
        ).length,

      unreadNotifications:
        notifications.filter(
          (notification) =>
            !notification.isRead
        ).length,
    });
  }
);

/* =========================================================
   SOCKET.IO
========================================================= */

io.on(
  "connection",
  (socket) => {
    console.log(
      `Socket connected: ${socket.id}`
    );

    socket.emit(
      "network-state",
      {
        hospitals,
        resources,
        requests,
        lendingTransactions,
        unreadNotifications:
          notifications.filter(
            (notification) =>
              !notification.isRead
          ).length,
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          `Socket disconnected: ${socket.id}`
        );
      }
    );
  }
);

/* =========================================================
   START
========================================================= */



server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("==========================================");
  console.log(`NexusCare backend running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Notifications: http://localhost:${PORT}/api/notifications`);
  console.log("Socket.io: ENABLED");
  console.log("==========================================");
  console.log("");
});