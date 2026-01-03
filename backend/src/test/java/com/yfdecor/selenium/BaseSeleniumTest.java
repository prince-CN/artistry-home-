package com.yfdecor.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public abstract class BaseSeleniumTest {
    
    protected WebDriver driver;
    protected WebDriverWait wait;
    private Process ffmpegProcess;
    private String currentRecordingPath;
    private static final String RECORDINGS_DIR = "test-recordings";
    private static final String SCREENSHOTS_DIR = "test-screenshots";
    
    // Base URL for the frontend application
    protected static final String BASE_URL = "http://localhost:8080";
    protected static final String API_URL = "http://localhost:8081/api";
    
    @BeforeAll
    static void setupClass() {
        WebDriverManager.chromedriver().setup();
        // Create directories for recordings and screenshots
        new File(RECORDINGS_DIR).mkdirs();
        new File(SCREENSHOTS_DIR).mkdirs();
    }
    
    @BeforeEach
    void setUp(TestInfo testInfo) {
        ChromeOptions options = new ChromeOptions();
        // Uncomment below line to run in headless mode (without browser UI)
        // options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1920,1080");
        
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        
        // Start video recording using FFmpeg
        startRecording(testInfo.getDisplayName());
    }
    
    @AfterEach
    void tearDown(TestInfo testInfo) {
        // Take screenshot at end of test
        takeScreenshot(testInfo.getDisplayName());
        
        // Stop video recording
        stopRecording();
        
        if (driver != null) {
            driver.quit();
        }
    }
    
    private String sanitizeFileName(String name) {
        return name.replaceAll("[^a-zA-Z0-9]", "_");
    }
    
    private void startRecording(String testName) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String fileName = sanitizeFileName(testName) + "_" + timestamp + ".mp4";
            currentRecordingPath = RECORDINGS_DIR + File.separator + fileName;
            
            // Use FFmpeg for screen recording (GDI grabber for Windows)
            ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-y",                           // Overwrite output
                "-f", "gdigrab",                // Windows screen capture
                "-framerate", "15",             // 15 FPS
                "-i", "desktop",                // Capture desktop
                "-c:v", "libx264",              // H.264 codec
                "-preset", "ultrafast",         // Fast encoding
                "-pix_fmt", "yuv420p",          // Compatible pixel format
                currentRecordingPath
            );
            pb.redirectErrorStream(true);
            ffmpegProcess = pb.start();
            
            System.out.println("🎥 Recording started: " + fileName);
        } catch (Exception e) {
            System.err.println("⚠️ Could not start recording (FFmpeg not found?): " + e.getMessage());
            System.err.println("   Install FFmpeg for video recording: https://ffmpeg.org/download.html");
        }
    }
    
    private void stopRecording() {
        if (ffmpegProcess != null && ffmpegProcess.isAlive()) {
            try {
                // Send 'q' to FFmpeg to gracefully stop
                ffmpegProcess.getOutputStream().write('q');
                ffmpegProcess.getOutputStream().flush();
                
                // Wait for FFmpeg to finish
                boolean finished = ffmpegProcess.waitFor(java.util.concurrent.TimeUnit.SECONDS.toMillis(5), java.util.concurrent.TimeUnit.MILLISECONDS);
                if (!finished) {
                    ffmpegProcess.destroyForcibly();
                }
                
                System.out.println("🎥 Recording saved: " + currentRecordingPath);
            } catch (Exception e) {
                System.err.println("⚠️ Could not stop recording: " + e.getMessage());
                ffmpegProcess.destroyForcibly();
            }
        }
    }
    
    protected void takeScreenshot(String testName) {
        try {
            if (driver instanceof TakesScreenshot) {
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                String fileName = sanitizeFileName(testName) + "_" + timestamp + ".png";
                File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
                Path destination = Paths.get(SCREENSHOTS_DIR, fileName);
                Files.copy(screenshot.toPath(), destination);
                System.out.println("📸 Screenshot saved: " + destination);
            }
        } catch (IOException e) {
            System.err.println("⚠️ Could not save screenshot: " + e.getMessage());
        }
    }
    
    protected void navigateTo(String path) {
        driver.get(BASE_URL + path);
    }
    
    protected void sleep(int milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
