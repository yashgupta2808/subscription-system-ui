import React from 'react';
import Link from 'next/link';

function HomePage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to My App</h1>
      <div style={{ marginTop: '20px' }}>
        <Link href="/signup">
          <button style={{ marginRight: '10px' }}>Sign Up</button>
        </Link>
        <Link href="/signin">
          <button>Sign In</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;