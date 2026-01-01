# ARHL Calculator Desktop

A comprehensive desktop application for calculating age-related hearing loss (ARHL) based on NHANES data and ASHA classification standards.

## Overview

This application is a desktop adaptation of the **ARHL Calculator** spreadsheet developed by **Robert Dobie, MD**. It provides clinical audiologists and hearing health professionals with an intuitive tool for analyzing hearing threshold data against population norms.

## Features

- **Population Norms Analysis**: Compare patient hearing thresholds against median and 95th percentile values
- **ASHA Classification**: Automatic classification of hearing loss severity (Normal, Slight, Mild, Moderate, Mod-Severe, Severe, Profound)
- **Multiple PTA Calculations**:
  - PTA 5123 (Speech frequencies: 500, 1000, 2000, 3000 Hz)
  - PTA 234 (OSHA STS: 2000, 3000, 4000 Hz)
- **Speech Intelligibility Index (SII) Calculations**:
  - Adult, Desensitized SII
  - Adult, NAL-NL2, Desensitized SII
- **Interactive Visualization**: Real-time graphing of patient data vs. population norms
- **Age and Sex Adjustment**: Calculations adjusted for patient age (20-80 years) and biological sex
- **Cross-Platform**: Available for Windows, macOS, and Linux

## Installation

### Download Pre-Built Binaries

Download the latest release for your platform:

- **Windows**: `ARHL-Calculator-Setup-{version}.exe`
- **macOS**: `ARHL-Calculator-{version}-arm64.dmg`
- **Linux**: 
  - Debian/Ubuntu: `arhl-calculator_{version}_amd64.deb`
  - AppImage: `ARHL-Calculator-{version}.AppImage`

[**Download Latest Release**](https://github.com/euphonic-euphemism/arhl-desktop/releases/latest)

### Linux Installation

**Debian/Ubuntu (.deb)**:
```bash
sudo dpkg -i arhl-calculator_*.deb
```

**AppImage**:
```bash
chmod +x ARHL-Calculator-*.AppImage
./ARHL-Calculator-*.AppImage
```

## Usage

1. **Set Baseline Parameters**:
   - Select patient sex (Male/Female)
   - Adjust age slider (20-80 years)

2. **Enter Patient Data**:
   - Click "Patient Data" button to open data entry panel
   - Enter hearing thresholds (dB HL) for frequencies 500-8000 Hz
   - Data automatically plots on the graph

3. **Review Results**:
   - View calculated PTAs with ASHA classification
   - Compare against population median and 95th percentile
   - Review SII calculations (when 500-6000 Hz data is complete)

4. **Clear and Reset**:
   - Use "Clear Input" button to reset patient data
   - Adjust age/sex to see population norms for different demographics

## Data Source

The normative data used in this application is derived from:

**Hoffman HJ, Dobie RA, Losonczy KG, Themann CL, Flamme GA.**
- *Declining Prevalence of Hearing Loss in US Adults Aged 20 to 69 Years.* JAMA Otolaryngol Head Neck Surg. 2017;143(3):274-285.
- *Epidemiology of Tinnitus.* In: Tyler RS, ed. Tinnitus Handbook. San Diego, CA: Singular; 2000:16-41.

Based on the **National Health and Nutrition Examination Survey (NHANES)** 2010/2012 data.

## Building from Source

### Prerequisites

- Node.js 18 or higher
- npm

### Development

```bash
# Clone the repository
git clone https://github.com/euphonic-euphemism/arhl-desktop.git
cd arhl-desktop

# Install dependencies
npm install

# Run development server
npm run dev

# Run Electron app in development
npm run electron:dev
```

### Build for Production

```bash
# Build for all platforms
npm run electron:build

# Build for specific platform
npm run electron:build -- --linux
npm run electron:build -- --win
npm run electron:build -- --mac
```

## Tech Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Desktop Framework**: Electron
- **Icons**: Lucide React
- **CI/CD**: GitHub Actions

## License

This application is provided for clinical and educational use. The original ARHL Calculator methodology was developed by Robert Dobie, MD.

## Acknowledgments

- **Dr. Robert Dobie, MD** - Original ARHL Calculator methodology
- **NHANES** - National Health and Nutrition Examination Survey data
- **ASHA** - American Speech-Language-Hearing Association classification standards

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/euphonic-euphemism/arhl-desktop/issues) on GitHub.

---

**Version**: 1.1.0  
**Author**: Mark Shaver  
**Repository**: [github.com/euphonic-euphemism/arhl-desktop](https://github.com/euphonic-euphemism/arhl-desktop)
