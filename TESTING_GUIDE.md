# Testing Guide for BitChest

## Overview

The BitChest application now includes comprehensive unit and feature tests covering:
- Authentication & authorization
- Wallet operations (buy/sell)
- Client management (CRUD operations)
- Cryptocurrency data
- Balance calculations
- Database constraints

## Quick Start

### Prerequisites

Ensure you have PHP and Composer installed:
```bash
php --version
composer --version
```

### Install Dependencies

```bash
cd backend
composer install
```

### Run Tests

#### Run all tests
```bash
php artisan test
```

#### Run only unit tests
```bash
php artisan test tests/Unit
```

#### Run only feature tests
```bash
php artisan test tests/Feature
```

#### Run specific test file
```bash
php artisan test tests/Feature/AuthenticationApiTest.php
```

#### Run specific test method
```bash
php artisan test tests/Feature/AuthenticationApiTest.php --filter=test_login_successful_with_correct_credentials
```

#### Generate coverage report
```bash
php artisan test --coverage
```

#### View coverage report with HTML
```bash
php artisan test --coverage --coverage-html=coverage
# Open coverage/index.html in your browser
```

## Test Structure

### Unit Tests (`tests/Unit/`)

#### AuthenticationTest.php
Tests user authentication and password security:
- Password hashing validation
- Password serialization (privacy)
- Invalid password rejection
- User role assignment
- Email consistency

**Run:**
```bash
php artisan test tests/Unit/AuthenticationTest.php
```

#### WalletCalculationsTest.php
Tests all wallet calculation logic:
- Average purchase price calculation
- Capital gain/loss calculations
- Holdings after sales
- Price non-negativity constraint
- Balance calculations

**Run:**
```bash
php artisan test tests/Unit/WalletCalculationsTest.php
```

#### ClientAccountTest.php
Tests client account model and relationships:
- Initial 500 EUR balance
- Decimal precision
- User-Account relationships
- Cascade deletion

**Run:**
```bash
php artisan test tests/Unit/ClientAccountTest.php
```

### Feature Tests (`tests/Feature/`)

#### AuthenticationApiTest.php
Tests authentication API endpoints:
- Login with correct credentials
- Login failure scenarios
- Password change functionality
- Session management
- Logout

**Run:**
```bash
php artisan test tests/Feature/AuthenticationApiTest.php
```

#### WalletApiTest.php
Tests wallet API endpoints:
- Buy cryptocurrency
- Sell cryptocurrency
- Balance deduction/credit
- Authorization checks
- Insufficient balance handling
- Insufficient holdings handling

**Run:**
```bash
php artisan test tests/Feature/WalletApiTest.php
```

#### ClientManagementApiTest.php
Tests client management API endpoints:
- Create client with temporary password
- Update client details
- Delete client
- Initial 500 EUR balance
- Authorization (admin only)
- Duplicate email prevention

**Run:**
```bash
php artisan test tests/Feature/ClientManagementApiTest.php
```

#### CryptocurrencyApiTest.php
Tests cryptocurrency API endpoints:
- View all cryptocurrencies
- View specific cryptocurrency with history
- Get current price
- Authorization checks

**Run:**
```bash
php artisan test tests/Feature/CryptocurrencyApiTest.php
```

## Understanding Test Output

When you run tests, you'll see output like:

```
Tests:     35 passed
Duration:  2.34s
```

Each test method should return either:
- ✓ **PASSED** - Test assertion was successful
- ✗ **FAILED** - Test assertion failed (shows error details)

### Example Output:
```
 PASS  Tests\Feature\AuthenticationApiTest
  ✓ login successful with correct credentials
  ✓ login fails with incorrect password
  ✓ login fails with non existent email
  ✓ password change requires authentication
  ✓ authenticated user can change password
  ✓ password change fails with wrong current password
  ✓ logout clears session
```

## Test Database

All tests use an in-memory SQLite database that is:
- **Isolated**: Tests don't affect production data
- **Fresh**: Each test starts with a clean database
- **Fast**: In-memory storage is much faster than disk

The test database is automatically created and destroyed for each test run.

## Common Test Scenarios

### Testing Authentication
```bash
php artisan test tests/Feature/AuthenticationApiTest.php --filter=test_login
```

### Testing Wallet Operations
```bash
php artisan test tests/Feature/WalletApiTest.php --filter=test_client_can_buy
```

### Testing Client CRUD
```bash
php artisan test tests/Feature/ClientManagementApiTest.php --filter=test_admin_can
```

### Testing Calculations
```bash
php artisan test tests/Unit/WalletCalculationsTest.php --filter=test_average_purchase_price
```

## Debugging Failed Tests

If a test fails:

1. **Read the error message**: It shows exactly what assertion failed
2. **Check the test file**: Look at the test method to understand intent
3. **Use `dd()` for debugging**: Add `dd($variable)` in your code
4. **Run with verbose output**: `php artisan test --verbose`

Example:
```bash
php artisan test tests/Feature/AuthenticationApiTest.php --verbose
```

## Adding New Tests

To add a new test:

1. Create a new test class in `tests/Unit/` or `tests/Feature/`
2. Extend `Tests\TestCase`
3. Use `RefreshDatabase` trait to reset database
4. Write test methods starting with `test_`

Example:
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MyFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_example()
    {
        $response = $this->get('/api/endpoint');
        $response->assertStatus(200);
    }
}
```

Then run it:
```bash
php artisan test tests/Feature/MyFeatureTest.php
```

## CI/CD Integration

For automated testing in CI/CD pipelines:

```bash
php artisan test --coverage --coverage-html=coverage --junit=test-results.xml
```

This generates:
- Code coverage report
- JUnit XML format (compatible with CI systems)

## Troubleshooting

### "No tests executed" error
- Ensure test files are in correct namespace
- Test methods must start with `test_`

### "Connection refused" error
- Database configuration issue
- Check `phpunit.xml` for SQLite configuration

### "Class not found" error
- Run `composer dump-autoload`
- Ensure test classes are properly namespaced

### Tests running slowly
- Use `--parallel` flag: `php artisan test --parallel`
- Reduce fixture data in factories

## Performance Tips

1. **Use factories instead of fixtures**: Factories are faster
2. **Only refresh database when needed**: Use `RefreshDatabase` trait
3. **Run tests in parallel**: `php artisan test --parallel`
4. **Cache test dependencies**: Tests will run faster on subsequent runs

## Resources

- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [Test-Driven Development Guide](https://en.wikipedia.org/wiki/Test-driven_development)
