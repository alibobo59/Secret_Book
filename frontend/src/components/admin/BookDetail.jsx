function BookDetail() {
    // ... existing code ...
    
    // Add this helper function to construct the image URL
    const getImageUrl = (imagePath) => {
        return imagePath ? `http://127.0.0.1:8000/storage/${imagePath}` : null;
    };
    
    // ... existing code ...
    
    <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
        <img
            src={getImageUrl(book.cover_image || book.image)}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
        />
    </div>
    
    // ... existing code ...
}