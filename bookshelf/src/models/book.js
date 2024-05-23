class Book {
  constructor(id, name, year, author, summary, publisher, pageCount, readPage, reading) {
      this.id = id;
      this.name = name;
      this.year = year;
      this.author = author;
      this.summary = summary;
      this.publisher = publisher;
      this.pageCount = pageCount;
      this.readPage = readPage;
      this.reading = reading;
      this.finished = readPage === pageCount;
      this.insertedAt = new Date().toISOString();
      this.updatedAt = this.insertedAt;
  }
}

export default Book;
