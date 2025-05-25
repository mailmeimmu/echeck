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
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-4 mx-4 flex flex-col max-h-[calc(100vh-2rem)]"
          >
            <div className="flex-shrink-0 bg-white border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between rounded-t-2xl">
              <BackButton onClick={handlePrevious} disabled={!selectedPropertyType} />
              <h2 className="text-xl font-bold text-center flex-1">
                {currentSection ? currentSection.title : 'نموذج الفحص'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {renderContent()}
            </div>

            <div className="flex-shrink-0 bg-white border-t border-gray-100 p-4 sm:p-6 rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
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