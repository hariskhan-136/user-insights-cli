const USER_URL = "https://jsonplaceholder.typicode.com/users";
const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";
const TODOS_URL = "https://jsonplaceholder.typicode.com/todos";

const fetchData = async () => {
  try {
    // Fetch all three endpoints concurrently
    const [usersResponse, postsResponse, todosResponse] = await Promise.all([
      fetch(USER_URL),
      fetch(POSTS_URL),
      fetch(TODOS_URL),
    ]);

    // Check if any API request failed
    if (!usersResponse.ok || !postsResponse.ok || !todosResponse.ok) {
      throw new Error("One or more API requests failed.");
    }

    // Convert all responses to JSON concurrently
    const [users, posts, todos] = await Promise.all([
      usersResponse.json(),
      postsResponse.json(),
      todosResponse.json(),
    ]);

    // Build a report for each user
    const report = users.map((user) => {
      const userPosts = posts.filter((post) => post.userId === user.id);

      const userTodos = todos.filter((todo) => todo.userId === user.id);

      const completedTodos = userTodos.filter((todo) => todo.completed).length;

      const openTodos = userTodos.filter((todo) => !todo.completed).length;

      return {
        name: user.name,
        email: user.email,
        city: user.address?.city ?? "Unknown",
        postCount: userPosts.length,
        completedTodos,
        openTodos,
      };
    });

    // Sort by post count (highest first)
    // If post counts are equal, sort by name
    const sortedReport = [...report].sort((a, b) => {
      if (b.postCount !== a.postCount) {
        return b.postCount - a.postCount;
      }
      return a.name.localeCompare(b.name);
    });

    // Print report
    console.log("\nUSER INSIGHTS REPORT");
    console.log("====================\n");

    console.log(
      `${"Name".padEnd(25)}${"Email".padEnd(35)}${"City".padEnd(20)}${"Post Count".padStart(14)}${"Completed Todos".padStart(18)}${"Open Todos".padStart(12)}`,
    );

    console.log("-".repeat(98));

    sortedReport.forEach((user) => {
      console.log(
        `${user.name.padEnd(25)}` +
          `${user.email.padEnd(35)}` +
          `${user.city.padEnd(20)}` +
          `${String(user.postCount).padStart(14)}` +
          `${String(user.completedTodos).padStart(18)}` +
          `${String(user.openTodos).padStart(11)}`,
      );
    });

    // Calculate summary statistics using reduce
    const summary = sortedReport.reduce(
      (result, user) => {
        result.totalUsers += 1;
        result.totalPosts += user.postCount;

        if (
          !result.topTodoUser ||
          user.completedTodos > result.topTodoUser.completedTodos
        ) {
          result.topTodoUser = user;
        }

        return result;
      },
      {
        totalUsers: 0,
        totalPosts: 0,
        topTodoUser: null,
      },
    );

    // Calculate average posts per user
    const averagePosts =
      summary.totalPosts > 0 ? summary.totalPosts / summary.totalUsers : 0;

    // Print summary
    console.log("\nSUMMARY");
    console.log("=======");

    console.log(`Total users: ${summary.totalUsers}`);
    console.log(`Total posts: ${summary.totalPosts}`);
    console.log(`Average posts per user: ${averagePosts.toFixed(2)}`);
    console.log(
      `User with most completed todos: ${summary.topTodoUser?.name ?? "None"}`,
    );
  } catch (error) {
    console.error(
      "\nUnable to fetch user insights. Please check your internet connection and try again.",
    );

    console.error(`Error: ${error.message}`);

    // Exit with a non-zero code
    process.exitCode = 1;
  }
};

fetchData();
