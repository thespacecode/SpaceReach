<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar')->nullable()->after('phone');
            $table->foreignId('department_id')->nullable()->after('avatar')->constrained()->nullOnDelete();
            $table->foreignId('designation_id')->nullable()->after('department_id')->constrained()->nullOnDelete();
            $table->unsignedBigInteger('reporting_to')->nullable()->after('designation_id');
            $table->string('employee_id')->nullable()->after('reporting_to');
            $table->date('joining_date')->nullable()->after('employee_id');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->after('joining_date');
            $table->timestamp('last_login_at')->nullable()->after('status');
            $table->string('last_login_ip')->nullable()->after('last_login_at');
            // two_factor columns are added by Fortify migration

            $table->foreign('reporting_to')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['reporting_to']);
            $table->dropForeign(['department_id']);
            $table->dropForeign(['designation_id']);
            $table->dropColumn([
                'phone', 'avatar', 'department_id', 'designation_id',
                'reporting_to', 'employee_id', 'joining_date', 'status',
                'last_login_at', 'last_login_ip',
            ]);
        });
    }
};
