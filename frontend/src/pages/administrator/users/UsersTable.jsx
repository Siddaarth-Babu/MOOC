// // src/pages/administrator/users/UsersTable.jsx
// import React from 'react'

// const UsersTable = ({ users = [], onDelete = () => {}, loading = false }) => {
//   return (
//     <div className="users-table-wrap" style={{ marginTop: 12 }}>
//       <div className="users-table">
//         <table>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>ID</th>
//               <th>Email</th>
//               <th>Role</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading && (
//               <tr><td colSpan="5" className="muted">Loading...</td></tr>
//             )}
//             {!loading && users.length === 0 && (
//               <tr><td colSpan="5" className="muted">No users found</td></tr>
//             )}
//             {!loading && users.map((u) => (
//               <tr key={`${u.role}-${u.id || u.numericId}`} className="users-row">
//                 <td>{u.name}</td>
//                 <td>{u.id}</td>
//                 <td>{u.email}</td>
//                 <td className="role-cell">{(u.role || '').replace('_', ' ')}</td>
//                 <td>
//                   <button
//                     className="btn btn-danger"
//                     onClick={() => onDelete(u.numericId, u.role)}
//                     disabled={loading || !u.numericId}
//                     title={!u.numericId ? "No id available to delete" : "Delete user"}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

// export default UsersTable
