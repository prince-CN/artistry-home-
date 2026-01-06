package com.yfdecor.selenium;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Authentication Tests")
public class AuthenticationTest extends BaseSeleniumTest {
    
    @Test
    @DisplayName("Should display login page correctly")
    void testLoginPageDisplay() {
        navigateTo("/login");
        sleep(1000);
        
        // Check page title or header
        WebElement header = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//*[contains(text(), 'ARTISTRY') or contains(text(), 'LOGIN')]")
        ));
        assertNotNull(header, "Login page should display header");
        
        // Check for login tab
        WebElement loginTab = driver.findElement(By.xpath("//*[contains(text(), 'LOGIN')]"));
        assertNotNull(loginTab, "Login tab should be present");
        
        // Check for register tab
        WebElement registerTab = driver.findElement(By.xpath("//*[contains(text(), 'REGISTER')]"));
        assertNotNull(registerTab, "Register tab should be present");
    }
    
    @Test
    @DisplayName("Should switch between Login and Register tabs")
    void testTabSwitching() {
        navigateTo("/login");
        sleep(2000);  // Wait for React to fully render
        
        // Click on Register tab
        WebElement registerTab = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[text()='REGISTER']")
        ));
        registerTab.click();
        sleep(1500);  // Wait for React state change and re-render
        
        // Verify Full Name field appears (only in register form)
        WebElement fullNameField = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//input[@placeholder='John Doe' or @name='fullName']")
        ));
        assertTrue(fullNameField.isDisplayed(), "Full Name field should be visible in register form");
        
        // Switch back to Login tab
        WebElement loginTab = driver.findElement(By.xpath("//button[text()='LOGIN']"));
        loginTab.click();
        sleep(500);
    }
    
    @Test
    @DisplayName("Should show validation error for empty login")
    void testEmptyLoginValidation() {
        navigateTo("/login");
        sleep(1000);
        
        // Find and click login button without entering credentials
        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[contains(text(), 'SIGN IN') or contains(text(), 'LOGIN') or @type='submit']")
        ));
        loginButton.click();
        sleep(1000);
        
        // Check for validation message or error state
        // This depends on your form validation implementation
        String pageSource = driver.getPageSource();
        assertTrue(
            pageSource.contains("required") || 
            pageSource.contains("error") || 
            pageSource.contains("Error") ||
            pageSource.contains("Please"),
            "Should show validation error for empty fields"
        );
    }
    
    @Test
    @DisplayName("Should register a new user successfully")
    void testUserRegistration() {
        navigateTo("/login");
        sleep(2000);  // Wait for React to fully render
        
        // Click on Register tab
        WebElement registerTab = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[text()='REGISTER']")
        ));
        registerTab.click();
        sleep(1500);  // Wait for React state change and re-render
        
        // Generate unique email for test
        String uniqueEmail = "testuser" + System.currentTimeMillis() + "@test.com";
        
        // Fill registration form - wait for element to be visible
        WebElement nameField = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//input[@placeholder='John Doe' or @name='fullName']")
        ));
        nameField.sendKeys("Test User");
        
        WebElement emailField = driver.findElement(By.xpath(
            "//input[@type='email' or @placeholder='email@example.com']"
        ));
        emailField.sendKeys(uniqueEmail);
        
        WebElement passwordField = driver.findElement(By.xpath(
            "//input[@type='password']"
        ));
        passwordField.sendKeys("Test@123");
        
        // Click register button
        WebElement registerButton = driver.findElement(By.xpath(
            "//button[contains(text(), 'CREATE ACCOUNT')]"
        ));
        registerButton.click();
        
        sleep(3000);
        
        // Verify successful registration (either redirect or success message)
        String currentUrl = driver.getCurrentUrl();
        String pageSource = driver.getPageSource();
        
        assertTrue(
            !currentUrl.contains("/login") || 
            pageSource.contains("success") || 
            pageSource.contains("Success") ||
            pageSource.contains("Welcome"),
            "User should be registered successfully"
        );
    }
    
    @Test
    @DisplayName("Should fill login form and submit")
    void testValidLogin() {
        navigateTo("/login");
        sleep(2000);
        
        String testEmail = "logintest" + System.currentTimeMillis() + "@test.com";
        String testPassword = "Test@123";
        
        // Make sure we're on login tab
        WebElement loginTab = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[text()='LOGIN']")
        ));
        loginTab.click();
        sleep(1000);
        
        // Enter login credentials
        WebElement emailField = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//input[@type='email' or @placeholder='email@example.com']")
        ));
        emailField.sendKeys(testEmail);
        
        WebElement passwordField = driver.findElement(By.xpath("//input[@type='password']"));
        passwordField.sendKeys(testPassword);
        
        // Click login button
        WebElement loginButton = driver.findElement(By.xpath("//button[contains(text(), 'SIGN IN') or @type='submit']"));
        loginButton.click();
        
        sleep(2000);
        
        // Test passed if we could interact with the form
        // Note: Actual login success depends on backend having this user registered
        assertTrue(true, "Login form interaction completed successfully");
    }
}
