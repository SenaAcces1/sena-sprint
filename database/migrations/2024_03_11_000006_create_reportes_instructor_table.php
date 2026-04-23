<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes_instructor', function (Blueprint $table) {
            $table->id('id_reporte_instructor');
            $table->string('reporte_head', 150);
            $table->text('reporte_body');
            $table->dateTime('reporte_datetime');
            $table->unsignedBigInteger('fk_id_user');
            $table->foreign('fk_id_user')->references('id_usuario')->on('usuarios');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes_instructor');
    }
};
