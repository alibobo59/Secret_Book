function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white py-4 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm">
          &copy; {currentYear} Admin Panel. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Version 1.0.0 |{" "}
          <a href="/admin/support" className="underline hover:text-amber-400">
            Support
          </a>{" "}
          |{" "}
          <a href="/admin/docs" className="underline hover:text-amber-400">
            Documentation
          </a>
        </p>
      </div>
    </footer>
  );
}

export default AdminFooter;
