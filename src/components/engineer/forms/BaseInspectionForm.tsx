Here's the fixed version with all missing closing brackets added:

```javascript
// ... (previous code remains the same until the renderContent function)

                {(question.requiresPhoto || 
                  (question.requiresPhoto === undefined && 
                   (answers[currentSection.id]?.[question.id] === true || 
                    answers[currentSection.id]?.[question.id] === false))) && (
                  <div className="mt-4">
                    <PhotoUploader
                      questionId={`${currentSection.id}_${question.id}`}
                      onUpload={handlePhotoUpload}
                      existingPhotos={photos[`${currentSection.id}_${question.id}`] || []}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      );
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b flex items-center justify-between">
              <BackButton onClick={handlePrevious} disabled={!selectedPropertyType} />
              <h2 className="text-xl font-bold text-center flex-1">
                {currentSection ? currentSection.title : 'نموذج الفحص'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {renderContent()}
            </div>

            <div className="p-4 sm:p-6 border-t">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-between items-center gap-4">
                {isSaving && (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Save size={16} />
                    جاري الحفظ...
                  </div>
                )}
                
                <Button
                  onClick={showPreview ? handleSubmit : handleNext}
                  disabled={loading || pdfGenerating}
                  className="w-full"
                >
                  {loading || pdfGenerating ? (
                    <LoadingSpinner />
                  ) : showPreview ? (
                    'إرسال التقرير'
                  ) : (
                    'التالي'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```