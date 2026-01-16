# UZip CLI

UZip is a powerful CLI tool built on top of 7-Zip that allows you to:

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
npm install -g uzip-cli
```

---

## Usage

### Compress

```bash
UZip -compress <input> <output> <size>
uz -compress <input> <output> <size>
```

Example:

```bash
UZip -compress "MyFolder" backup 2g
uz -compress "MyFolder" backup 2g
```

---

### Restore

```bash
uzip -restore <folder>
uz -restore <folder>
```

### Example:

```bash
uzip -restore backup
uz -restore backup
```

---

### Help

```bash
uzip --help
uz --help

uzip -h
uz -h
```

---

### Version

```bash
uzip --version
uz --version

uzip -v
uz -v
```
