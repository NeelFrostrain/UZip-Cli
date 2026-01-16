# Ultra-Zip CLI

Ultra-Zip is a powerful CLI tool built on top of 7-Zip that allows you to:

- Ultra-compress folders
- Split archives into parts
- Restore from split archives
- Show real-time progress
- Delete parts interactively
- Use simple CLI commands
- Works as a global CLI
- Works as a Windows EXE

---

## Features

- Real progress bar: `[████░░░░░░] 42%`
- Split size support (e.g. `500m`, `2g`)
- Restore from split archives
- Interactive cleanup prompt
- JSON metadata (`index.json`)
- Windows-safe paths
- CLI flags
- Error handling
- Works with `pkg` EXE

---

## Installation (Global)

### From NPM (once published)

```bash
npm install -g ultra-zip
```

---

## Usage

### Compress

```bash
ultra-zip -compress <input> <output> <size>
```

Example:

```bash
ultra-zip -compress "MyFolder" backup 2g
```

---

### Restore

```bash
ultra-zip -restore <folder>
```

Example:

```bash
ultra-zip -restore backup
```

---

### Help

```bash
ultra-zip --help
ultra-zip -h
```

---

### Version

```bash
ultra-zip --version
ultra-zip -v
```
