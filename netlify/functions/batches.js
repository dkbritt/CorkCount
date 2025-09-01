import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../../server/routes/batches.ts";

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
    // Handle both direct calls and redirected calls
    let path = event.path || '';
    if (path.startsWith('/.netlify/functions/batches')) {
      path = path.replace('/.netlify/functions/batches', '');
    } else if (path.startsWith('/api/batches')) {
      path = path.replace('/api/batches', '');
    }

    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};

    // GET /batches
    if (method === "GET" && (path === "" || path === "/")) {
      const result = await getBatches();

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

    // POST /batches (create new batch)
    if (method === "POST" && (path === "" || path === "/")) {
      const result = await createBatch(body);

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

    // PUT /batches/:id (update batch)
    if (method === "PUT" && path.startsWith("/")) {
      const id = path.substring(1); // Remove leading slash
      const result = await updateBatch(id, body);

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

    // DELETE /batches/:id
    if (method === "DELETE" && path.startsWith("/")) {
      const id = path.substring(1); // Remove leading slash
      const result = await deleteBatch(id);

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
        error: "Batches endpoint not found",
      }),
    };
  } catch (error) {
    console.error("Batches error:", error);
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
