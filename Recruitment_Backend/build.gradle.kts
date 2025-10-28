plugins {
	java
	id("org.springframework.boot") version "3.4.1"
	id("io.spring.dependency-management") version "1.1.7"
	id("io.freefair.lombok") version "8.6"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot starters
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.thymeleaf.extras:thymeleaf-extras-springsecurity6")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.apache.commons:commons-lang3")
    // JWT dependencies
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    runtimeOnly("com.mysql:mysql-connector-j")
    testRuntimeOnly("com.h2database:h2")
    
    // Development tools
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    
    // Additional utilities
    implementation("com.turkraft.springfilter:jpa:3.1.7")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0")
    
    // ✅ SỬA: Test dependencies - Thêm JUnit Platform
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    
    // ✅ THÊM: JUnit Platform dependencies
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    
    // ✅ THÊM: Playwright dependencies
    testImplementation("com.microsoft.playwright:playwright:1.40.0")
    testImplementation("org.assertj:assertj-core:3.24.2")
}

// ✅ SỬA: Test configuration với màu sắc đẹp
tasks.withType<Test> {
    useJUnitPlatform()
    
    // ✅ THÊM: JVM arguments cho Java 23
    jvmArgs = listOf(
        "--add-opens", "java.base/java.lang=ALL-UNNAMED",
        "--add-opens", "java.base/java.util=ALL-UNNAMED"
    )
    
    // 🎨 THÊM: System properties cho encoding UTF-8
    systemProperty("file.encoding", "UTF-8")
    systemProperty("sun.jnu.encoding", "UTF-8")
    
    // 🎨 THÊM: Hiển thị kết quả test với màu sắc
    testLogging {
        events("passed", "skipped", "failed", "standardOut", "standardError")
        
        // Hiển thị chi tiết
        showExceptions = true
        showCauses = true
        showStackTraces = true
        
        // Hiển thị output của System.out.println
        showStandardStreams = true
        
        // Màu sắc cho từng event
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
        
        // Hiển thị message chi tiết
        displayGranularity = 2
    }
    
    // 🎨 Thêm màu sắc ANSI cho console
    afterTest(KotlinClosure2({ desc: org.gradle.api.tasks.testing.TestDescriptor, result: org.gradle.api.tasks.testing.TestResult ->
        val status = when (result.resultType) {
            org.gradle.api.tasks.testing.TestResult.ResultType.SUCCESS -> "✅ PASSED"
            org.gradle.api.tasks.testing.TestResult.ResultType.FAILURE -> "❌ FAILED"
            org.gradle.api.tasks.testing.TestResult.ResultType.SKIPPED -> "⏭️ SKIPPED"
        }
        val color = when (result.resultType) {
            org.gradle.api.tasks.testing.TestResult.ResultType.SUCCESS -> "\u001B[32m" // Green
            org.gradle.api.tasks.testing.TestResult.ResultType.FAILURE -> "\u001B[31m" // Red
            org.gradle.api.tasks.testing.TestResult.ResultType.SKIPPED -> "\u001B[33m" // Yellow
        }
        val reset = "\u001B[0m"
        println("$color$status$reset ${desc.className} > ${desc.name} (${result.endTime - result.startTime}ms)")
    }))
    
    // 📊 Summary sau khi chạy xong
    afterSuite(KotlinClosure2({ desc: org.gradle.api.tasks.testing.TestDescriptor, result: org.gradle.api.tasks.testing.TestResult ->
        if (desc.parent == null) { // Root suite
            println("\n" + "=".repeat(80))
            println("🎯 TEST RESULTS SUMMARY")
            println("=".repeat(80))
            println("Tests run: ${result.testCount}")
            println("✅ Passed: \u001B[32m${result.successfulTestCount}\u001B[0m")
            println("❌ Failed: \u001B[31m${result.failedTestCount}\u001B[0m")
            println("⏭️ Skipped: \u001B[33m${result.skippedTestCount}\u001B[0m")
            println("⏱️ Total time: ${(result.endTime - result.startTime) / 1000.0}s")
            println("=".repeat(80) + "\n")
        }
    }))
}

// ✅ THÊM: Skip tests nếu muốn build nhanh
tasks.named("build") {
    dependsOn("test")
}

// ✅ THÊM: Task để build mà không chạy test
tasks.register("buildWithoutTests") {
    dependsOn("assemble")
}

// ✅ PLAYWRIGHT TASKS
tasks.register<JavaExec>("playwrightInstall") {
    group = "playwright"
    description = "Install Playwright browsers"
    classpath = configurations.testRuntimeClasspath.get()
    mainClass.set("com.microsoft.playwright.CLI")
    args("install")
}

tasks.register<Test>("playwrightTest") {
    group = "playwright"
    description = "Run Playwright E2E tests"
    useJUnitPlatform()
    
    // Chỉ chạy Playwright tests
    include("**/playwright/tests/*Test.class")
    include("**/playwright/tests/*Tests.class")
    
    systemProperty("playwright.headless", "true")
    systemProperty("frontend.url", "http://localhost:5173")
    systemProperty("backend.url", "http://localhost:8080")
    
    // 🎨 Kế thừa test logging từ tasks.withType<Test>
    testLogging {
        events("passed", "skipped", "failed", "standardOut", "standardError")
        showExceptions = true
        showCauses = true
        showStackTraces = true
        showStandardStreams = true
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
    
    dependsOn("playwrightInstall")
}

tasks.register<Test>("playwrightTestHeaded") {
    group = "playwright"
    description = "Run Playwright tests with browser visible"
    useJUnitPlatform()
    
    include("**/playwright/tests/*Test.class")
    include("**/playwright/tests/*Tests.class")
    
    systemProperty("playwright.headless", "false")
    systemProperty("frontend.url", "http://localhost:5173")
    systemProperty("backend.url", "http://localhost:8080")
    
    // 🎨 Kế thừa test logging
    testLogging {
        events("passed", "skipped", "failed", "standardOut", "standardError")
        showExceptions = true
        showCauses = true
        showStackTraces = true
        showStandardStreams = true
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
    
    dependsOn("playwrightInstall")
}