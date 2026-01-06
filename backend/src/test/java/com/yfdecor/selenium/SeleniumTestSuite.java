package com.yfdecor.selenium;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

/**
 * Selenium Test Suite for Artistry Home E-commerce Application
 * 
 * This suite runs all Selenium WebDriver tests for the application.
 * 
 * Prerequisites:
 * 1. Backend should be running on http://localhost:8081
 * 2. Frontend should be running on http://localhost:8082
 * 3. Chrome browser should be installed
 * 
 * To run tests:
 * mvn test -Dtest=SeleniumTestSuite
 * 
 * Or run individual test classes:
 * mvn test -Dtest=AuthenticationTest
 * mvn test -Dtest=HomePageTest
 * mvn test -Dtest=ShopPageTest
 * mvn test -Dtest=CartTest
 * mvn test -Dtest=ProductDetailTest
 * mvn test -Dtest=CheckoutTest
 * mvn test -Dtest=UserAccountTest
 */
@Suite
@SuiteDisplayName("Artistry Home Selenium Test Suite")
@SelectClasses({
    HomePageTest.class,
    AuthenticationTest.class,
    ShopPageTest.class,
    ProductDetailTest.class,
    CartTest.class,
    CheckoutTest.class,
    UserAccountTest.class
})
public class SeleniumTestSuite {
    // This class is just a holder for the above annotations
}
