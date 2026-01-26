import { useContext, useEffect, useState } from "react";

import api from "../services/api";

import { AuthContext } from "../context/AuthContext";



function StudentTimetable() {

const { user } = useContext(AuthContext);



const [data, setData] = useState([]);

const [error, setError] = useState("");



useEffect(() => {

const load = async () => {

try {

if (!user?.classId) {

setError("Class not assigned");

return;

}



const res = await api.get(`/api/timetable/class/${user.classId}`);

setData(res.data || []);

} catch {

setError("Failed to load timetable");

}

};



load();

}, [user]);



return (

<>

<h3 className="fw-bold mb-3">My Timetable</h3>



{error && <div className="alert alert-warning">{error}</div>}



{!error && data.length === 0 && (

<div className="alert alert-info">No timetable available</div>

)}



{data.length > 0 && (

<div className="bg-white p-3 shadow-sm" style={{ borderRadius: "8px" }}>

<table className="table table-bordered mb-0">

<thead className="table-light">

<tr>

<th>Day</th>

<th>Time</th>

<th>Subject</th>

<th>Teacher</th>

</tr>

</thead>

<tbody>

{data.map((t) => (

<tr key={t._id}>

<td>{t.day}</td>

<td>{t.timeSlot}</td>

<td>{t.subject}</td>

<td>{t.teacher?.name || "-"}</td>

</tr>

))}

</tbody>

</table>

</div>

)}

</>

);

}



export default StudentTimetable;