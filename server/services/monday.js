const axios = require("axios");

const mondayClient = axios.create({
  baseURL: process.env.MONDAY_API_URL || "https://api.monday.com/v2",
  headers: {
    "Content-Type": "application/json",
    Authorization: process.env.MONDAY_API_TOKEN,
  },
});

// Generic Monday.com GraphQL request
async function mondayQuery(query, variables = {}) {
  try {
    const response = await mondayClient.post("", {
      query,
      variables,
    });

    if (response.data.errors) {
      throw new Error(JSON.stringify(response.data.errors));
    }

    return response.data.data;
  } catch (error) {
    console.error("Monday API Error:", error.message);
    throw error;
  }
}

// Fetch one board
async function getBoard(boardId) {
  const query = `
    query {
      boards(ids: [${boardId}]) {
        id
        name
        state

        columns {
          id
          title
          type
        }

        items_page(limit: 500) {
          items {
            id
            name

            column_values {
              id
              text
              value
              type
            }
          }
        }
      }
    }
  `;

  const data = await mondayQuery(query);

  if (!data.boards || data.boards.length === 0) {
    throw new Error(`Board ${boardId} was not found`);
  }

  return data.boards[0];
}

// Fetch both Monday.com boards
async function getBothBoards() {
  const dealBoard = await getBoard(
    process.env.MONDAY_DEAL_BOARD_ID
  );

  const workOrderBoard = await getBoard(
    process.env.MONDAY_WORK_ORDER_BOARD_ID
  );

  return {
    deals: dealBoard,
    workOrders: workOrderBoard,
  };
}

module.exports = {
  mondayQuery,
  getBoard,
  getBothBoards,
};