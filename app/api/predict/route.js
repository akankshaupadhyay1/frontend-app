export async function POST(request) {
  console.log('➡️ POST request received at /api/predict');

  try {
    const formData = await request.json();
    console.log('✅ Form data parsed:', formData);

    // Backend service URL inside the cluster
    const backendURL = 'http://backend-service.default.svc.cluster.local:8000/predict';
    console.log(`🔗 Sending request to backend at: ${backendURL}`);

    // Send request to FastAPI backend
    const response = await fetch(`${backendURL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Backend responded with error:', error);
      return new Response(JSON.stringify({ detail: error.detail || 'Backend error' }), {
        status: response.status
      });
    }

    const result = await response.json();
    console.log('✅ Received response from backend:', result);

    console.log('✅ Sending success response back to client');
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ API Handler Error:', error);
    return new Response(JSON.stringify({ detail: error.message || 'Server error' }), {
      status: 500
    });
  }
}


// export async function POST(request) {
//   try {
//     const formData = await request.json();

//     // Backend service URL inside the cluster
//     const backendURL = 'http://backend-service.default.svc.cluster.local:8000/predict';

//     // Send request to FastAPI backend
//     const response = await fetch(`${backendURL}/predict`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(formData)
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       return new Response(JSON.stringify({ detail: error.detail || 'Backend error' }), {
//         status: response.status
//       });
//     }

//     const result = await response.json();

//     return new Response(JSON.stringify(result), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   } catch (error) {
//     console.error('API Handler Error:', error);
//     return new Response(JSON.stringify({ detail: error.message || 'Server error' }), {
//       status: 500
//     });
//   }
// }
