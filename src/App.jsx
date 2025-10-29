import React, { useState, useCallback } from 'react';
import { Search, BookOpen, User, Hash, Loader2, Frown } from 'lucide-react';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchBooks = useCallback(async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term.');
      setBooks([]);
      setHasSearched(true);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setBooks([]);

    try {
      const url = new URL('https://openlibrary.org/search.json');
      url.searchParams.set(searchType, searchTerm);
      url.searchParams.set(
        'fields',
        'key,title,author_name,first_publish_year,cover_i,isbn'
      );
      url.searchParams.set('limit', 24);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Network response was not successful.');
      }

      const data = await response.json();

      if (data.docs && data.docs.length > 0) {
        setBooks(data.docs);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(
        'Failed to fetch books. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const LoadingSpinner = () => (
    <div className="spinner-container">
      <Loader2 size={20} className="spinner" />
    </div>
  );

  return (
    <div id="root-container">
      <div className="container">
        {}
        <header className="app-header">
          <h1>
            <BookOpen size={40} />
            Alex's Book Finder
          </h1>
          <p>Search for books by title, author, or subject.</p>
        </header>

        {}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-form-inner">
            {}
            <div className="search-select-wrapper">
              <span className="search-select-icon">
                {searchType === 'title' && <BookOpen size={20} />}
                {searchType === 'author' && <User size={20} />}
              </span>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                aria-label="Search type"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
              </select>
            </div>

            {}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search by ${searchType}...`}
              aria-label="Search term"
              className="search-input"
            />

            {}
            <button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner /> : <Search size={20} />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {}
        <main>
          {}
          {loading && (
            <div className="status-message loading">
              <Loader2 size={48} className="spinner" />
              <p>Finding books...</p>
            </div>
          )}

          {}
          {error && !loading && (
            <div className="status-message error">
              <Frown size={48} />
              <p className="error-text">{error}</p>
            </div>
          )}

          {}
          {!loading && !error && hasSearched && books.length === 0 && (
            <div className="status-message no-results">
              <Frown size={48} />
              <p>No books found for your search.</p>
              <p>Try a different search term or category.</p>
            </div>
          )}

          {!loading && !error && !hasSearched && (
            <div className="status-message initial">
              <BookOpen size={48} />
              <p>
                Start your search to find books for your courses and projects!
              </p>
            </div>
          )}

          {}
          {!loading && !error && books.length > 0 && (
            <div className="results-grid">
              {books.map((book) => (
                <BookCard key={book.key} book={book} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function BookCard({ book }) {
  const coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : book.isbn && book.isbn[0]
    ? `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`
    : null;
  3;

  const placeholderCover = `https://placehold.co/180x270/667eea/ffffff?text=${encodeURIComponent(
    book.title.split(' ').slice(0, 3).join(' ')
  )}`;
  const workUrl = `https://openlibrary.org${book.key}`;

  return (
    <a
      href={workUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="book-card"
    >
      <img
        src={coverUrl || placeholderCover}
        onError={(e) => {
          if (e.target.src !== placeholderCover) {
            e.target.src = placeholderCover;
          }
        }}
        alt={`Cover of ${book.title}`}
        className="book-cover"
        loading="lazy"
      />
      <div className="book-card-content">
        <h3 title={book.title}>{book.title}</h3>
        <p
          className="book-author"
          title={book.author_name?.join(', ') || 'Unknown Author'}
        >
          by {book.author_name?.join(', ') || 'Unknown Author'}
        </p>
        <p className="book-publish-year">
          First published: {book.first_publish_year || 'N/A'}
        </p>
      </div>
    </a>
  );
}
