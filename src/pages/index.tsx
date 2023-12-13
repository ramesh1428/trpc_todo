import { trpc } from '../utils/trpc';
import { useState, useEffect } from 'react';

export default function IndexPage() {
  const pageSize = 5; 

  const hello = trpc.hello.useQuery();

  const getTodoQuery = trpc.getTodo.useQuery({
    variables: {
      page: 1,
      pageSize: pageSize,
    },
  });

  const [newTodoTask, setNewTodoTask] = useState('');
  const [selectedTodo, setSelectedTodo] = useState(null);

  const createTodoMutation = trpc.createTodo.useMutation();
  const updateTodoMutation = trpc.updateTodo.useMutation();
  const deleteTodoMutation = trpc.deleteTodo.useMutation();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {

    hello.refetch();
    // Refetch data after creating, updating, or deleting a todo
    getTodoQuery.refetch({
      variables: {
        page: currentPage,
        pageSize: pageSize,
      },
    });
  }, [createTodoMutation.isSuccess, updateTodoMutation.isSuccess, deleteTodoMutation.isSuccess, currentPage]);

  const handleCreateTodo = async () => {
    try {
      if (selectedTodo) {
        await updateTodoMutation.mutate({
          id: selectedTodo.id,
          task: newTodoTask,
        });
      } else {
        await createTodoMutation.mutate({ task: newTodoTask });
      }

      setNewTodoTask('');
      setSelectedTodo(null);
    } catch (error) {
      console.error('Error creating/updating todo:', error);
    }
  };

  const handleUpdateTodo = (id, task) => {
    setSelectedTodo({ id, task });
    setNewTodoTask(task);
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodoMutation.mutate({ id });

      setNewTodoTask('');
      setSelectedTodo(null);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (getTodoQuery.isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  const usersPerPage = pageSize;
  const pagesVisited = (currentPage - 1) * usersPerPage;

  return (
    <div className="container mx-auto mt-8">
      <table className="w-full border-collapse border rounded-lg">
        <thead>
          <tr>
            <th className="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300">Serial Number</th>
            <th className="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300">Task</th>
            <th className="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {getTodoQuery.data?.todos.slice(pagesVisited, pagesVisited + usersPerPage).map((todo, index) => (
            <tr key={todo.id} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td className="p-3 border border-gray-300">{pagesVisited + index + 1}</td>
              <td className="p-3 border border-gray-300">{todo.task}</td>
              <td className="p-3 flex items-center space-x-2 border border-gray-300">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                  onClick={() => handleUpdateTodo(todo.id, todo.task)}
                >
                  Update
                </button>
                <button
                  className={`px-4 py-2 ${getTodoQuery.data?.delete_enable !== 'Enable' ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-700'}`}
                  onClick={() => handleDeleteTodo(todo.id)}
                  disabled={getTodoQuery.data?.delete_enable !== 'Enable'}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <div>
          Page {currentPage} of {Math.ceil(getTodoQuery.data?.todos.length / usersPerPage)}
        </div>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(getTodoQuery.data?.todos.length / usersPerPage)))}
            disabled={currentPage === Math.ceil(getTodoQuery.data?.todos.length / usersPerPage)}
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={newTodoTask}
          onChange={(e) => setNewTodoTask(e.target.value)}
          className="p-2 border border-gray-300"
        />
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          onClick={handleCreateTodo}
        >
          {selectedTodo ? 'Update Todo' : 'Create Todo'}
        </button>

        {(createTodoMutation.isLoading || updateTodoMutation.isLoading) && <div className="mt-2">Saving Todo...</div>}
        {deleteTodoMutation.isLoading && <div className="mt-2">Deleting Todo...</div>}
      </div>
    </div>
  );
}
