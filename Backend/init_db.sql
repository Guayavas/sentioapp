-- Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Username NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(200) NOT NULL,
        Role NVARCHAR(50) NOT NULL,
        Identifier NVARCHAR(50) NULL -- Cédula or similar ID
    );
END

-- Categories Table (Derived from Sheet Names like 'Familia', 'Autoestima')
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(255) NOT NULL UNIQUE
    );
END

-- Questions Table (The 'F1' cell content)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Questions')
BEGIN
    CREATE TABLE Questions (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Text NVARCHAR(MAX) NOT NULL
    );
END

-- Imports Table (To track uploads)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Imports')
BEGIN
    CREATE TABLE Imports (
        Id INT PRIMARY KEY IDENTITY(1,1),
        ImportDate DATETIME2 DEFAULT GETDATE(),
        FileName NVARCHAR(255) NULL
    );
END

-- Responses Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Responses')
BEGIN
    CREATE TABLE Responses (
        Id INT PRIMARY KEY IDENTITY(1,1),
        QuestionId INT NOT NULL,
        CategoryId INT NOT NULL,
        ImportId INT NOT NULL,
        ResponseText NVARCHAR(MAX),

        -- Demographic Data (Columns A-E)
        Universidad NVARCHAR(255),
        Programa NVARCHAR(255),
        SexoBiologico NVARCHAR(50),
        OrientacionSexual NVARCHAR(100),
        GrupoEtnico NVARCHAR(100),

        CONSTRAINT FK_Responses_Questions FOREIGN KEY (QuestionId) REFERENCES Questions(Id),
        CONSTRAINT FK_Responses_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id),
        CONSTRAINT FK_Responses_Imports FOREIGN KEY (ImportId) REFERENCES Imports(Id)
    );
END

-- Default Admin User (Password: "admin")
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin@example.com')
BEGIN
    INSERT INTO Users (Username, PasswordHash, FullName, Role, Identifier)
    VALUES ('admin@example.com', '$2a$11$vFfu6g139ic08OqD2ezzJuirYyx8aKMtvTGA2g6ed3NRruwYwH3r6', 'Administrator', 'Admin', '000000000');
END

-- SEED DATA (To verify Explorer)
IF NOT EXISTS (SELECT * FROM Categories WHERE Name = 'Familia')
BEGIN
    -- 1. Create Import Record
    INSERT INTO Imports (FileName, ImportDate) VALUES ('Datos_Semilla.xlsx', GETDATE());
    DECLARE @ImportId INT = SCOPE_IDENTITY();

    -- 2. Create Categories
    INSERT INTO Categories (Name) VALUES ('Familia'), ('Académica'), ('Autoestima');
    DECLARE @CatFamilia INT = (SELECT Id FROM Categories WHERE Name = 'Familia');
    DECLARE @CatAcademica INT = (SELECT Id FROM Categories WHERE Name = 'Académica');

    -- 3. Create Questions
    INSERT INTO Questions (Text) VALUES ('¿Cómo describes tu relación con tu familia?');
    DECLARE @Q1 INT = SCOPE_IDENTITY();

    INSERT INTO Questions (Text) VALUES ('¿Sientes presión por tu rendimiento académico?');
    DECLARE @Q2 INT = SCOPE_IDENTITY();

    -- 4. Create Responses
    INSERT INTO Responses (QuestionId, CategoryId, ImportId, ResponseText, Universidad, Programa, SexoBiologico, OrientacionSexual, GrupoEtnico)
    VALUES
    (@Q1, @CatFamilia, @ImportId, 'Me llevo muy bien con mis padres, siempre me apoyan.', 'Universidad de Nariño', 'Ingeniería', 'Masculino', 'Heterosexual', 'Mestizo'),
    (@Q1, @CatFamilia, @ImportId, 'A veces discutimos pero nos queremos.', 'Universidad de Nariño', 'Medicina', 'Femenino', 'Heterosexual', 'Ninguno'),
    (@Q2, @CatAcademica, @ImportId, 'Sí, siento mucha ansiedad antes de los parciales.', 'Universidad de Nariño', 'Derecho', 'Femenino', 'Bisexual', 'Afrocolombiano');
END
