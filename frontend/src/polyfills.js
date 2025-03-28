import { Buffer } from 'buffer';
import process from 'process';

// Set up Buffer
window.Buffer = Buffer;

// Set up process
window.process = process;

// Set up global
window.global = window; 