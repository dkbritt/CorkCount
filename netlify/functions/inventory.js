import {
  getAvailableInventory,
  getAllInventory,
  updateInventoryQuantities,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../../server/routes/inventory.ts";

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    const path = event.path.replace("/.netlify/functions/inventory", "");
    const method = event.httpMethod;
    const queryParams = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};

    // GET /inventory or /inventory/update
    if (method === "GET" && (path === "" || path === "/")) {
      const { admin } = queryParams;
      const result =
        admin === "true"
          ? await getAllInventory()
          : await getAvailableInventory();

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    // POST /inventory (add new item)
    if (method === "POST" && (path === "" || path === "/")) {
      const result = await addInventoryItem(body);

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    // PUT /inventory/update (bulk update quantities)
    if (method === "PUT" && path === "/update") {
      const { updates } = body;

      if (!Array.isArray(updates)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Updates must be an array",
          }),
        };
      }

      const result = await updateInventoryQuantities(updates);

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    // PUT /inventory/:id (update specific item)
    if (method === "PUT" && path.startsWith("/") && path !== "/update") {
      const id = path.substring(1); // Remove leading slash
      const result = await updateInventoryItem(id, body);

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    // DELETE /inventory/:id
    if (method === "DELETE" && path.startsWith("/")) {
      const id = path.substring(1); // Remove leading slash
      const result = await deleteInventoryItem(id);

      if (result.success) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(result),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Inventory endpoint not found",
      }),
    };
  } catch (error) {
    console.error("Inventory error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
    };
  }
};
